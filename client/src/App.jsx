import { useState, useEffect, useRef } from 'react'
import WeatherChart from './components/WeatherChart'
import './App.css'

const ENDPOINTS = [
  'http://localhost:3001/api/readings',
  'http://192.168.1.159:3001/api/readings'
]

function App() {
  const [activeMetric, setActiveMetric] = useState('temperature')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [availableTopics, setAvailableTopics] = useState([])
  const [subscribedTopics, setSubscribedTopics] = useState(new Set())
  const subscriptions = useRef(new Map())
  const [page, setPage] = useState('topics')
  const [readings, setReadings] = useState({
    temperature: new Map(),
    windspeed: new Map(),
    humidity: new Map()
  })

  async function fetchReadings(day = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0]) { //Gets weather data from today
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(`${url}?day=${day}`)
        if (!res.ok) continue
        const data = await res.json()
        const maps = { temperature: new Map(), windspeed: new Map(), humidity: new Map() }
        for (const r of data) {
          maps.temperature.set(r.timestamp, r.temperature)
          maps.windspeed.set(r.timestamp, r.windspeed)
          maps.humidity.set(r.timestamp, r.humidity)
        }
        setReadings(maps)
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
    fetch("http://localhost:3001/api/topics")
      .then(res => res.json())
      .then(data => setAvailableTopics(data))
  }, [])

  function subscribe(topic) {
    if (subscriptions.current.has(topic)) return

    const source = new EventSource(`http://localhost:3001/api/${topic}`)
    source.onmessage = (e) => {
      const newData = JSON.parse(e.data)
      if (newData.connected) return
      setReadings(prev => {
        const updated = new Map(prev[topic])
        if (updated.size >= 24) {
          const oldest = [...updated.keys()].sort()[0]
          updated.delete(oldest)
        }
        updated.set(newData.timestamp, newData.value)
        return { ...prev, [topic]: updated }
      })
      setLastUpdated(new Date())
    }
    source.onerror = (e) => console.error(`SSE error on ${topic}:`, e)

    subscriptions.current.set(topic, source)
    setSubscribedTopics(prev => new Set([...prev, topic]))
  }

  function unsubscribe(topic) {
    subscriptions.current.get(topic)?.close()
    subscriptions.current.delete(topic)
    setSubscribedTopics(prev => {
      const next = new Set(prev)
      next.delete(topic)
      return next
    })
  }

  useEffect(() => {
    return () => subscriptions.current.forEach(source => source.close())
  }, [])

  function toggleTopic(topic) {
    if (subscriptions.current.has(topic)) {
      unsubscribe(topic)
      return
    }
    subscribe(topic)
  }

  function confirmTopics() {
    setPage('dashboard')
  }

  if (page === 'topics') {
    return (
      <div>
        <h1>Choose Topics</h1>
        {availableTopics.map(topic => (
          <button
            key={topic}
            onClick={() => toggleTopic(topic)}
            className={subscribedTopics.has(topic) ? 'active' : ''}
          >
            {topic.charAt(0).toUpperCase() + topic.slice(1)}
          </button>
        ))}
        <button onClick={confirmTopics}>Confirm</button>
      </div>
    )
  }

  const hasData = readings.temperature.size > 0 || readings.humidity.size > 0 || readings.windspeed.size > 0

  if (!hasData)
    return <p>No data yet</p>

  return (
    <div className="app">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Weather Dashboard</h1>
          <p className="location">Odense, Danmark</p>
          {lastUpdated && (
            <p className="updated">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <button className="topic-button" onClick={() => setPage('topics')}>Change Topics</button>
      </div>

      <div className="weather-cards">
        {subscribedTopics.has('temperature') && (
          <div className="card">
            <p className="card-label">Temperature</p>
            <p className="card-value">
              {[...readings.temperature.values()].pop()?.toFixed(1)} °C
            </p>
          </div>
        )}
        {subscribedTopics.has('humidity') && (
          <div className="card">
            <p className="card-label">Humidity</p>
            <p className="card-value">
              {[...readings.humidity.values()].pop()} %
            </p>
          </div>
        )}
        {subscribedTopics.has('windspeed') && (
          <div className="card">
            <p className="card-label">Windspeed</p>
            <p className="card-value">
              {[...readings.windspeed.values()].pop()?.toFixed(1)} m/s
            </p>
          </div>
        )}
      </div>

      <div className="tabs">
        {['temperature', 'humidity', 'windspeed']
          .filter(metric => subscribedTopics.has(metric))
          .map(metric => (
            <button
              key={metric}
              className={activeMetric === metric ? 'active' : ''}
              onClick={() => setActiveMetric(metric)}
            >
              {metric === 'temperature' ? 'Temperature' : metric === 'windspeed' ? 'Wind speed' : 'Humidity'}
            </button>
          ))}
      </div>
      <WeatherChart readings={readings} metric={activeMetric} />
    </div>
  )
}

export default App