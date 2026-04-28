import { useState, useEffect } from 'react'
import WeatherChart from './components/WeatherChart'
import DisplayingWeatherEntry from './components/displaying_weather_entry'
import './App.css'


const ENDPOINTS = [
  'http://localhost:3001/api/readings',
  'http://192.168.1.159:3001/api/readings'  // network ip (might need to replace)
]

function App() {
  const [readings, setReadings] = useState([])
  const [activeMetric, setActiveMetric] = useState('temperature')
  const [lastUpdated, setLastUpdated] = useState(null)

async function fetchReadings() { //fetches the weather data from first working url
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

  useEffect(() => {
    fetchReadings()
    const interval = setInterval(fetchReadings, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>
      <p className="location">H.C. Andersen Airport, Odense</p>
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