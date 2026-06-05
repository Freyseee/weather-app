require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { Topics } = require('./topics');
const broker = require('./broker');
require('./poller');
require('./topics')

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/readings', (req, res) => {
  const day = req.query.day ?? new Date().toISOString().split('T')[0]; //Choose which day you want
  let readings = db.prepare(`
    SELECT * FROM weather_readings
    WHERE timestamp LIKE ?
    ORDER BY timestamp ASC
  `).all(`${day}%`);
  if (readings.length === 0) {
  let latest = db.prepare(`
    SELECT * FROM weather_readings
    ORDER BY timestamp DESC
    LIMIT 1
  `).get();

  if (latest) 
    readings = [latest];
  }
  res.json(readings);
});


app.get('/api/topics', (req, res) => { 
  res.json([...Topics]);
});


//PUBLISH SUBSCRIBE PATTERN STUFF -----------------------------------------------------------------------------------

// all subscribers are stored here with the topics they are subscribed to
const subscribers = new Map();

//get all subscribers that are subscribed to a specific topic
function getSubscribers(topic) {
  if (!subscribers.has(topic)) 
    subscribers.set(topic, new Set()); 

  return subscribers.get(topic);
}

app.get('/api/:topic', (req, res) => { //This is where the clients will be able to sunscribe to a topic
  const {topic} = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); //Sends headers before continuing

  if(!Topics.has(topic)){ //topics.js has the topics you can subscribe to
    res.write('Cannot subscribe to: ' + topic)
    return;
  }

  //confirm the connection is made
  broker.subscribe(topic, res);
  console.log("New subscriber: " + topic);
  res.write(`data: ${JSON.stringify({ connected: true })}\n\n`); //¯\_(ツ)_/¯

  req.on("close", () => {
    broker.unsubscribe(topic, res);
    console.log("Client unsubscribed from: " + topic);
  });

});

app.post("/publish/:topic", (req, res) => { //Redundant (for now at least)
  broker.publish(req.params.topic, req.body);
  console.log("Published to topic: " + req.params.topic);
  res.json({ ok: true });
});


//--------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); //Using port 3001
});