function DisplayingWeatherEntry({ readings }) {
  const latest = readings[readings.length - 1]

  if (!latest) return <p>Loading...</p>

  return (
    <div className="weather-cards">
      <div className="card">
        <p className="card-label">Temperature</p>
        <p className="card-value">{latest.temperature.toFixed(1)} °C</p>
      </div>
      <div className="card">
        <p className="card-label">Wind speed</p>
        <p className="card-value">{latest.windspeed.toFixed(1)} m/s</p>
      </div>
      <div className="card">
        <p className="card-label">Humidity</p>
        <p className="card-value">{latest.humidity} %</p>
      </div>
    </div>
  )
}

export default DisplayingWeatherEntry