require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('./poller');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/readings', (req, res) => {
  const readings = db.prepare(`
    SELECT * FROM weather_readings
    ORDER BY timestamp DESC
    LIMIT 24
  `).all();

  res.json(readings.reverse());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});