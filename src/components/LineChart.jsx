import React from 'react'
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

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const LineChart = ({
  title = 'Financial Analysis',
  grossRevenueData,
  grossYear,
  grossExpensesData,
  revenueColor,
  expensesColor,
}) => {
  // Enhanced data validation function
  const validateAndProcessData = () => {
    // Check if any required data is missing or invalid
    if (!grossRevenueData || !grossYear || !grossExpensesData) {
      return { isValid: false, reason: 'missing' }
    }

    // Check if data is string type
    if (
      typeof grossRevenueData !== 'string' ||
      typeof grossYear !== 'string' ||
      typeof grossExpensesData !== 'string'
    ) {
      return { isValid: false, reason: 'invalid_type' }
    }

    // Process the data
    const revenueData = grossRevenueData.split(',').map((val) => {
      const cleaned = val.trim()
      return cleaned === '' ? 0 : parseFloat(cleaned) || 0
    })

    const years = grossYear
      .split(',')
      .map((year) => year.trim())
      .filter((year) => year !== '')

    const expensesData = grossExpensesData.split(',').map((val) => {
      const cleaned = val.trim()
      return cleaned === '' ? 0 : parseFloat(cleaned) || 0
    })

    // Validate processed data
    if (
      years.length === 0 ||
      revenueData.length === 0 ||
      expensesData.length === 0
    ) {
      return { isValid: false, reason: 'empty_data' }
    }

    // Ensure consistent array lengths
    const minLength = Math.min(
      years.length,
      revenueData.length,
      expensesData.length
    )

    return {
      isValid: true,
      data: {
        years: years.slice(0, minLength),
        revenue: revenueData.slice(0, minLength),
        expenses: expensesData.slice(0, minLength),
      },
    }
  }

  const validation = validateAndProcessData()

  // Don't render anything if data is missing or invalid
  if (!validation.isValid) {
    return null
  }

  const { years, revenue, expenses } = validation.data

  const lineData = {
    labels: years,
    datasets: [
      {
        label: 'Gross Revenue',
        data: revenue,
        fill: false,
        borderColor: revenueColor,
        backgroundColor: 'rgba(255, 112, 16, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: revenueColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: revenueColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        tension: 0.4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: 'rgba(255, 112, 16, 0.3)',
      },
      {
        label: 'Gross Expenses',
        data: expenses,
        fill: false,
        borderColor: expensesColor,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: expensesColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: expensesColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        tension: 0.4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: 'rgba(99, 102, 241, 0.3)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          font: {
            size: 13,
            weight: '600',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      title: {
        display: false, // We'll use custom title
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#ff7010',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
          weight: '500',
        },
        callbacks: {
          label: function (context) {
            const value = parseFloat(context.parsed.y).toLocaleString('en-IN')
            return `${context.dataset.label}: ₹${value} Million`
          },
          title: function (context) {
            return `Financial Year ${context[0].label}`
          },
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
        ticks: {
          font: {
            size: 12,
            weight: '500',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
          padding: 8,
          callback: function (value) {
            return parseFloat(value).toLocaleString('en-IN')
          },
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
    animation: {
      duration: 1500,
      easing: 'easeInOutCubic',
    },
    onHover: (event, activeElements) => {
      event.native.target.style.cursor =
        activeElements.length > 0 ? 'pointer' : 'default'
    },
  }

  return (
    <>
      <div className="bg-slate-100 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-slate-200 border-b border-gray-200 px-8 py-6">
          <div className="">
            <div>
              <h2 className="text-center font-aptos">{title}</h2>
              <h2 className="text-lg font-aptos-extrabold text-gray-800 mb-1">
                Financial Performance Analysis
              </h2>
              <p className="text-gray-600 text-sm text-center font-aptos-semibold">
                Revenue vs Expenses Overview
              </p>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="pl-1 pb-2">
          <div className="h-96 relative">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
        {/* <hr className="text-[#ff7010] my-5 border-2" /> */}
      </div>
      <hr className="text-[#ff7010] my-5 border-2" />
    </>
  )
}

export default LineChart
