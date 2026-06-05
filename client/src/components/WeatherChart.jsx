import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

const metricConfig = {
  temperature: { label: 'Temperature (°C)', color: '#d45c16' },
  humidity: { label: 'Humidity (%)', color: '#236bd8' },
  windspeed: { label: 'Wind speed (m/s)', color: '#5dd467' }
}

function WeatherChart({ readings, metric }) {
  const config = metricConfig[metric]
  const metricMap = readings[metric]

  if (!metricMap || metricMap.size === 0) return <p>No data yet...</p>
  if (metricMap.size === 1) return <p className="OutdatedWarningText">Possible outdated data displayed</p>

  const entries = [...metricMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  const data = {
    labels: entries.map(([ts]) => new Date(ts).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: config.label,
      data: entries.map(([, val]) => val),
      borderColor: config.color,
      backgroundColor: config.color + '25',
      borderWidth: 2,
      pointRadius: 5,
      fill: true,
      tension: 0.3
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: false }
    }
  }

  return <Line key={metric} data={data} options={options} />
}

export default WeatherChart