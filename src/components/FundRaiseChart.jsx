import React, { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const FundRaiseChart = ({
  title = 'Financial Analysis',
  labels = [],
  datasets = [],
  competitor = false,
  heading,
  subHeading,
  fundRaiseRound,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const chartRef = useRef(null)

  const rounds = fundRaiseRound?.split(',').map((r) => r.trim()) || []

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 }
    )
    if (chartRef.current) observer.observe(chartRef.current)
    return () => {
      if (chartRef.current) observer.unobserve(chartRef.current)
    }
  }, [])

  const lineData = { labels, datasets }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 13, weight: '600' },
          color: '#374151',
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex
            const round = rounds[index] || 'Round'
            const value = parseFloat(context.parsed.y).toLocaleString('en-IN')
            return `${
              round.charAt(0).toUpperCase() + round.slice(1)
            } Raise: ₹${value} Million`
          },
          title: (context) => `Financial Year ${context[0].label}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
        },
        border: {
          color: '#d1d5db',
          width: 1,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
          padding: 8,
        },
        title: {
          display: true,
          text: 'Financial Years',
          font: {
            size: 13,
            weight: '600',
          },
          color: '#374151',
          padding: { top: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
        },
        border: {
          color: '#d1d5db',
          width: 1,
        },
        title: {
          display: true,
          text: 'Amount (₹ in Millions)',
          font: {
            size: 13,
            weight: '600',
          },
          color: '#374151',
          padding: { bottom: 10 },
        },
        ticks: {
          font: {
            size: 12,
            weight: '500',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
          padding: 8,
          callback: (value) => parseFloat(value).toLocaleString('en-IN'),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
      },
      point: {
        hoverBorderWidth: 3,
        hoverRadius: 7,
      },
    },
    animation: isVisible ? { duration: 1200, easing: 'easeInOutCubic' } : false,
    onHover: (event, activeElements) => {
      event.native.target.style.cursor =
        activeElements.length > 0 ? 'pointer' : 'default'
    },
  }

  return (
    <div
      className={`rounded-lg border-2 border-slate-300 overflow-hidden ${
        competitor
          ? 'bg-red-50 border-2 border-red-300'
          : 'bg-slate-100 border border-gray-200'
      }`}
      ref={chartRef}
    >
      {/* Header */}
      <div
        className={`px-8 py-4 ${
          competitor
            ? 'bg-red-100 border-b border-red-300'
            : 'bg-slate-200 border-b border-gray-200'
        }`}
      >
        <h2 className="text-center font-aptos">
          {title}
          {competitor && (
            <span className="ml-2 px-2 py-1 text-xs rounded bg-red-500 text-white">
              Competitor
            </span>
          )}
        </h2>
        <h2 className="text-lg text-center font-aptos-extrabold text-gray-800 mb-1">
          {heading}
        </h2>
        {subHeading && (
          <p className="text-gray-600 text-sm text-center font-aptos-semibold">
            {subHeading}
          </p>
        )}
      </div>
      {/* Chart */}
      <div className="h-96 relative p-4">
        {isVisible && <Line data={lineData} options={chartOptions} />}
      </div>
    </div>
  )
}

export default FundRaiseChart
