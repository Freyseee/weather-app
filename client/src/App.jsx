import { useState, useEffect } from 'react'
import WeatherChart from './components/WeatherChart'
import DisplayingWeatherEntry from './components/displaying_weather_entry'
import './App.css'


const ENDPOINTS = [
  'http://localhost:3001/api/readings',
  'http://192.168.1.159:3001/api/readings'  // network address (change for local network hosting)
]

function App() {
  const [readings, setReadings] = useState([]) //This is what makes the graph autoamtically update.
  const [activeMetric, setActiveMetric] = useState('temperature') //temperature is the most used weather metric by people so the chart will show temperature as default
  const [lastUpdated, setLastUpdated] = useState(null) //Is set to null so that no chart is shown before a fetch has occured


  // This method goes through all endpoints given in the ENDPOINTS variable and then tries each one till it finds one that works. 
async function fetchReadings() { 
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      setReadings(data)
      setLastUpdated(new Date())
      return
    } catch (err) {
      console.log(`Failed to fetch from ${url}, trying next...`)
    }
  }
  console.error('All endpoints failed')
}

// updates every 5 minutes
useEffect(() => {
  fetchReadings()

  const eventSource = new EventSource('/api/events')

  function handleNewReading(event) {
    const reading = JSON.parse(event.data)

    setReadings(prev => {
      const updatedReadings = [...prev.slice(-23), reading] //This does so that there is always a maximum of 24 readings on the graph (takes the newest 23 from the readings and then adds the new one)
      return updatedReadings
    })
      setLastUpdated(new Date());
    }

  eventSource.onmessage = handleNewReading;

  return () => {
    eventSource.close()
  }
}, [])

  //Returns the chart and UI stuff
  return (
    <div className="app">
      <h1>Weather Dashboard</h1>
      <p className="location">Odense, Danmark</p>
      {lastUpdated && (
        <p className="updated">Updated {lastUpdated.toLocaleTimeString()}</p>
      )}
      <DisplayingWeatherEntry readings={readings} />
      <div className="tabs">
        {['temperature', 'wind_speed', 'humidity'].map(metric => (
          <button
            key={metric}
            className={activeMetric === metric ? 'active' : ''}
            onClick={() => setActiveMetric(metric)}
          >
            {metric === 'temperature' ? 'Temperature' : metric === 'wind_speed' ? 'Wind speed' : 'Humidity'}
          </button>
        ))}
      </div>
      <WeatherChart readings={readings} metric={activeMetric} />
    </div>
  )
}

export default App