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
  temperature: { label: 'Temperature (°C)', color: '#1D9E75' },
  wind_speed:  { label: 'Wind speed (m/s)', color: '#378ADD' },
  humidity:    { label: 'Humidity (%)',      color: '#BA7517' }
}

function WeatherChart({ readings, metric }) {
  const config = metricConfig[metric]

  const data = {
    labels: readings.map(r => new Date(r.timestamp).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: config.label,
      data: readings.map(r => r[metric]),
      borderColor: config.color,
      backgroundColor: config.color + '22',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.35
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 } },
      y: { beginAtZero: false }
    }
  }

  if (readings.length === 0) return <p>No data yet...</p>

  return <Line data={data} options={options} />
}

export default WeatherChart