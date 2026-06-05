const cron = require('node-cron'); //Used as the "clock"
const db = require('./db');
const broker = require('./broker');

async function fetchAndStore() {
  try {
    const response = await fetch('https://dmi.cma.dk/api/weather/current/5000'); //fetches from area code 5000 (Odense)
    const data = await response.json();
    const last = db.prepare(`SELECT timestamp FROM weather_readings ORDER BY timestamp DESC LIMIT 1`).get();

    if (last && last.timestamp === data.timestamp) { //We dont like data repeats here
    console.log('No new data, skipping insert:', data.timestamp);
    return;
    }

    //Save the datapoint
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

    //PUBLISH
    broker.publish('temperature', { value: data.temperature.value, timestamp: data.timestamp }); 
    broker.publish('windspeed', { value: data.wind.speed, timestamp: data.timestamp });
    broker.publish('humidity', { value: data.humidity, timestamp: data.timestamp });

    console.log('Published to broker, subscriber counts:',
    'temp:', broker.getSubscribers('temperature').size,
    'wind:', broker.getSubscribers('windspeed').size,
    'humidity:', broker.getSubscribers('humidity').size
    );

  } catch (error) {
    console.error('Fetch failed: ', error);
  }
}

fetchAndStore();

cron.schedule('*/10 * * * *', fetchAndStore); //Uses cron to fetch new weather data every 10 minutes (which is how often the API updates)

module.exports = { fetchAndStore };