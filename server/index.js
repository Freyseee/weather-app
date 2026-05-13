require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('./poller');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.get('/api/events', (req, res) => { //This is where the clients will get the new data from (PS pattern)
  res.setHeader('Connection', 'keep-alive')

  function NewReading(data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  
  emitter.on('new-event', NewReading)

  req.on('close', () => {
  emitter.off('new-reading', NewReading)
  })

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});