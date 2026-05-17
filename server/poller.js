const cron = require('node-cron'); //Used as the "clock"
const db = require('./db');
const broker = require('./eventBroker');

async function fetchAndStore() {
  try {
    const response = await fetch('https://dmi.cma.dk/api/weather/current/5000'); //fetches from area code 5000 (Odense)
    const data = await response.json();

    const insert = db.prepare(`
      INSERT INTO weather_readings (timestamp, temperature, windspeed, humidity)
      VALUES (?, ?, ?, ?)
    `);

    insert.run(
      data.timestamp,
      data.temperature.value,
      data.wind.speed,
      data.humidity
    );

    console.log('Successful data fetch:', data.timestamp);
/*
    broker.emit('new_event', { //This is where the broker is like "a new event has been recorded" and sends the data for that event. This is handled in the index file
      timestamp: data.timestamp,
      temperature: data.temperature.value,
      wind_speed: data.wind.speed,
      humidity: data.humidity
    }); */

  } catch (error) {
    console.error('Fetch failed: ', error);
  }
}

fetchAndStore();

cron.schedule('*/10 * * * *', fetchAndStore); //Uses cron to fetch new weather data every 10 minutes

module.exports = { fetchAndStore };