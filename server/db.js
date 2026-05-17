const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'weather.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS weather_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    temperature REAL NOT NULL,
    windspeed REAL NOT NULL,
    humidity REAL NOT NULL
  )
`);

module.exports = db;