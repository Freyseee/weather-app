const cron = require('node-cron'); //Used as the "clock"
const db = require('./db');

async function fetchAndStore() {
  try {
    const response = await fetch('https://dmi.cma.dk/api/weather/current/5000');
    const data = await response.json();

    const insert = db.prepare(`
      INSERT INTO weather_readings (timestamp, temperature, wind_speed, humidity)
      VALUES (?, ?, ?, ?)
    `);

    insert.run(
      data.timestamp,
      data.temperature.value,
      data.wind.speed,
      data.humidity
    );

    console.log('Reading saved:', data.timestamp);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
  }
}

fetchAndStore();

cron.schedule('*/5 * * * *', fetchAndStore);

module.exports = { fetchAndStore };