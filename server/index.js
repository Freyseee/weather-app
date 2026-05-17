require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { Topics } = require('./topics');
require('./poller');
require('./topics')

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/readings', (req, res) => { //Might change limit to a higher number
  const readings = db.prepare(`
    SELECT * FROM weather_readings
    ORDER BY timestamp DESC
    LIMIT 24 
  `).all();

  res.json(readings.reverse());
});



//PUBLISH SUBSCRIBE PATTERN STUFF -----------------------------------------------------------------------------------

// all subscribers are stored here with the topics they are subscribed to
const subscribers = new Map();

//get all subscribers that are subscribed to a specific topic
function getSubscribers(topic) {

  if (!subscribers.has(topic)) subscribers.set(topic, new Set()); 
  return subscribers.get(topic);
}

app.get('/api/:topic', (req, res) => { //This is where the clients will be able to sunscribe to a topic
  const {topic} = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); //Sends headers before continuing

  if(!Topics.has(topic)){
    res.write('Cannot subscribe to: ' + topic)
    return;
  }

  //add the new subscriber to the topic
  const topicSubs = getSubscribers(topic);
  topicSubs.add(res);

  //confirm the connection is made
  console.log("New subscriber: " + topic)
  res.write('Successfully subscribed to: ' + topic)

  req.on("close", () => {
    topicSubs.delete(res);
    console.log("Client unsubscribed from: " + topic)
  });

});


app.post("/publish/:topic", (req, res) => {
  const { topic } = req.params;
  const req_data = req.body;

  const topicSubs = getSubscribers(topic);
  if (topicSubs.size === 0) {
    return res.json({ error: "No subscribers to topic: " + topic });
  }

  for (const client of topicSubs) {
    client.write(`data: ${JSON.stringify(req.body)}\n\n`);;
  }

  console.log("Published to topic: " + topic);
});


app.get("/topics", (req, res) => {
  res.json([...Topics]); 
});


//--------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});