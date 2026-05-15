import { useState, useEffect, useRef } from 'react'
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
  
  const [availableTopics, setAvailableTopics] = useState([])
  const [subscribedTopics, setSubscribedTopics] = useState(new Set())
  const [showTopics, setShowTopics] = useState(false)
  const subscriptions = useRef(new Map())

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
  console.error('All endpoints failed: Unable to retrieve data from database')
}

// updates every 5 minutes
useEffect(() => {
  fetch("http://localhost:3001/topics")
    .then(res => res.json())
    .then(data => setAvailableTopics(data));
}, []);

//Subscribe to a topic
function subscribe(topic) {
  if (subscriptions.current.has(topic)) return;

  const source = new EventSource(`http://localhost:3001/api/${topic}`);
  source.onmessage = (e) => console.log(`[${topic}]`, JSON.parse(e.data));
  source.onerror = (e) => console.error(`SSE error on ${topic}:`, e);

  subscriptions.current.set(topic, source);
  setSubscribedTopics(prev => new Set([...prev, topic]));
}

//Unsubscribe to a topic
function unsubscribe(topic) {
  subscriptions.current.get(topic)?.close();
  subscriptions.current.delete(topic);
  setSubscribedTopics(prev => {
    const next = new Set(prev);
    next.delete(topic);
    return next;
  });
}

// cleanup
useEffect(() => {
  return () => subscriptions.current.forEach(source => source.close());
}, []);

//Buttons and button events
function toggleTopic(topic) {

    if (subscriptions.current.has(topic)) {
      unsubscribe(topic)
      return
    }

    subscribe(topic)
  }

  return (
    <div>
      <h1>Choose Topics</h1>

      <button onClick={() => toggleTopic("temperature")}>
        Temperature
      </button>

      <button onClick={() => toggleTopic("humidity")}>
        Humidity
      </button>

      <button onClick={() => toggleTopic("windspeed")}>
        WindSpeed
      </button>
    </div>
  )
}


export default App