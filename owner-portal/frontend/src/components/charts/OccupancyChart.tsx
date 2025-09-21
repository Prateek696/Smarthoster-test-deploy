import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface OccupancyChartProps {
  propertyId: number | null
  timeRange: string
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ propertyId, timeRange }) => {
  // TODO: Replace with real API calls to fetch occupancy data
  const data = {
    labels: [],
    datasets: [
      {
        label: 'Occupancy Rate',
        data: [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.y}% occupied`
          }
        }
      }
    },
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        border: {
          display: false
        },
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: (value: any) => {
            return `${value}%`
          }
        },
        max: 100
      }
    },
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  )
}

export default OccupancyChart



