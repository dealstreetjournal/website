import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaBuilding, FaUser, FaIndustry, FaCalendarAlt, FaCheckSquare, FaSquare, FaFileAlt, FaLock, FaGlobe, FaMapMarkerAlt, FaChartLine } from 'react-icons/fa'
import Swal from 'sweetalert2'
import spinner from '../assets/spinner.png'
import { fetchFiCompanyDetail, initiateFiOrder } from '../api/fiApi'
import { useAuth } from '../hooks/useAuth'

const PRICE_PER_YEAR = 299


const SmartReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAuthenticated = !!user

  const [selectedYears, setSelectedYears] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [paying, setPaying] = useState(false)

  const { isPending, isError, data: company } = useQuery({
    queryKey: ['fi-company', id],
    queryFn: () => fetchFiCompanyDetail(id),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.financialYears?.length > 0) setSelectedYears([...data.financialYears])
      if (data?.reportTypes?.length > 0) setSelectedTypes(data.reportTypes.map((r) => r.key))
    },
  })

  // Set defaults once data loads
  const years = company?.financialYears || []
  const reportTypes = company?.reportTypes || []

  const effectiveYears = selectedYears.length > 0 ? selectedYears : years
  const effectiveTypes = selectedTypes.length > 0 ? selectedTypes : (reportTypes.length > 0 ? reportTypes.map((r) => r.key) : ['all'])

  const totalAmount = (effectiveYears.length * PRICE_PER_YEAR).toString()

  const toggleYear = (yr) => {
    setSelectedYears((prev) =>
      prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr]
    )
  }

  const toggleType = (key) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSelectAllYears = () => setSelectedYears([...years])
  const handleClearYears = () => setSelectedYears([])
  const handleSelectAllTypes = () => setSelectedTypes(reportTypes.map((r) => r.key))
  const handleClearTypes = () => setSelectedTypes([])

  const handlePay = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to purchase reports.',
        icon: 'info',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Go to Login',
      }).then(() => navigate('/login'))
      return
    }

    if (effectiveYears.length === 0) {
      Swal.fire({ title: 'Select Years', text: 'Please select at least one financial year.', icon: 'warning', confirmButtonColor: '#ff7010' })
      return
    }

    if (effectiveTypes.length === 0) {
      Swal.fire({ title: 'Select Report Types', text: 'Please select at least one report type.', icon: 'warning', confirmButtonColor: '#ff7010' })
      return
    }

    if (!userName.trim()) {
      Swal.fire({ title: 'Name Required', text: 'Please enter your full name.', icon: 'warning', confirmButtonColor: '#ff7010' })
      return
    }

    if (!userPhone.trim() || userPhone.trim().length < 10) {
      Swal.fire({ title: 'Phone Required', text: 'Please enter a valid 10-digit phone number.', icon: 'warning', confirmButtonColor: '#ff7010' })
      return
    }

    setPaying(true)

    try {
      const payload = {
        excelStoreId: parseInt(id),
        companyName: company.companyName,
        selectedYears: effectiveYears,
        selectedPdfTypes: effectiveTypes,
        amount: totalAmount,
        userName: userName.trim(),
        userPhone: userPhone.trim(),
      }

      const data = await initiateFiOrder(payload)

      if (!data.success) {
        Swal.fire({ title: 'Error', text: data.message || 'Failed to initiate payment.', icon: 'error', confirmButtonColor: '#ff7010' })
        setPaying(false)
        return
      }

      const paytmConfig = {
        root: '',
        flow: 'DEFAULT',
        data: {
          orderId: data.orderId,
          token: data.txnToken,
          tokenType: 'TXN_TOKEN',
          amount: data.amount,
        },
        merchant: {
          mid: data.mid,
          name: 'Deal Street Journal',
        },
        handler: {
          notifyMerchant: (eventName) => {
            if (eventName === 'APP_CLOSED') {
              setPaying(false)
              Swal.fire({ title: 'Payment Cancelled', text: 'You have cancelled the payment.', icon: 'warning', confirmButtonColor: '#ff7010' })
            }
          },
        },
      }

      if (window.Paytm && window.Paytm.CheckoutJS) {
        await window.Paytm.CheckoutJS.init(paytmConfig)
        window.Paytm.CheckoutJS.invoke()
      } else {
        Swal.fire({ title: 'Error', text: 'Paytm SDK not loaded. Please refresh and try again.', icon: 'error', confirmButtonColor: '#ff7010' })
        setPaying(false)
      }
    } catch (error) {
      console.error('Payment error:', error)
      const msg = error?.response?.status === 401
        ? 'Please login to continue.'
        : error?.response?.data?.message || 'Failed to initiate payment. Please try again.'
      Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#ff7010' })
      if (error?.response?.status === 401) navigate('/login')
      setPaying(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img src={spinner} alt="Loading" className="w-10 h-10 animate-spin mix-blend-multiply" />
      </div>
    )
  }

  if (isError || !company) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Company not found.</p>
        <Link to="/smart-reports" className="text-[#ff7010] mt-2 inline-block">Back to Smart Reports</Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen py-6">
      <div className="max-w-5xl mx-auto w-[90%]">

        {/* Breadcrumb */}
        <div className="font-semibold flex justify-start space-x-1 mb-6 text-sm">
          <Link to="/dsj-insight" className="text-black hover:text-slate-700">DSJ</Link>
          <span className="text-gray-400">/</span>
          <Link to="/smart-reports" className="text-black hover:text-slate-700">DSJ AI Report</Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#ff7010] truncate max-w-[200px]">{company.companyName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Company Info + Selections */}
          <div className="lg:col-span-2 space-y-5">

            {/* Company Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Header: logo + name */}
              <div className="flex items-start gap-4 mb-4">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.companyName}
                    className="w-14 h-14 rounded-lg object-contain border border-gray-100 bg-gray-50 flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-[#ff7010] text-xl" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900">{company.companyName}</h1>
                  {company.industry && <p className="text-sm text-gray-400 mt-0.5">{company.industry}</p>}
                </div>
              </div>

              {/* About */}
              {company.description && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed border-l-2 border-orange-200 pl-3">
                  {company.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {company.cin && (
                  <InfoRow icon={<FaBuilding />} label="CIN" value={company.cin} mono />
                )}
                {!company.description && company.industry && (
                  <InfoRow icon={<FaIndustry />} label="Industry" value={company.industry} />
                )}
                {company.ceo && (
                  <InfoRow icon={<FaUser />} label="CEO / MD" value={company.ceo} />
                )}
                {company.incorporationDate && (
                  <InfoRow icon={<FaCalendarAlt />} label="Incorporated" value={company.incorporationDate} />
                )}
                {company.website && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0"><FaGlobe /></span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Website</p>
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff7010] font-medium text-sm truncate hover:underline block"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-2 text-sm sm:col-span-2">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0"><FaMapMarkerAlt /></span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Registered Address</p>
                      <p className="text-gray-700 font-medium text-sm">{company.address}</p>
                    </div>
                  </div>
                )}
              </div>
              {company.boardOfDirectors && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Board of Directors</p>
                  <p className="text-sm text-gray-700">{company.boardOfDirectors}</p>
                </div>
              )}
            </div>

            {/* Financial Preview (teaser) */}
            {company.financialPreview && company.financialPreview.rows?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine className="text-[#ff7010]" />
                  <h2 className="font-bold text-gray-900">Financial Highlights</h2>
                  <span className="text-xs bg-orange-50 text-[#ff7010] border border-orange-100 px-2 py-0.5 rounded-full ml-auto">
                    {company.financialPreview.section}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 min-w-[160px]">Metric</th>
                        {company.financialPreview.years.map((yr) => (
                          <th key={yr} className="text-right text-xs text-gray-400 font-medium pb-2 px-3 whitespace-nowrap">{yr}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {company.financialPreview.rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2.5 pr-4 text-gray-700 font-medium text-xs">{row.label}</td>
                          {row.locked ? (
                            company.financialPreview.years.map((_, yi) => (
                              <td key={yi} className="py-2.5 px-3 text-right">
                                <span className="inline-flex items-center gap-1 text-gray-300 select-none">
                                  <FaLock className="text-[10px]" />
                                  <span className="blur-sm text-xs font-mono">₹{(Math.random() * 900 + 100).toFixed(1)} Cr</span>
                                </span>
                              </td>
                            ))
                          ) : (
                            (row.values || []).map((val, vi) => (
                              <td key={vi} className="py-2.5 px-3 text-right text-gray-900 font-semibold text-xs font-mono">
                                {val != null ? `${(val / 10000000).toFixed(2)} Cr` : '—'}
                              </td>
                            ))
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <FaLock className="text-gray-300" />
                    {company.financialPreview.rows.filter(r => r.locked).length} more metrics locked — purchase to unlock full data
                  </p>
                  <button
                    onClick={() => document.getElementById('year-selection')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-xs text-[#ff7010] font-semibold hover:underline whitespace-nowrap"
                  >
                    Get Full Report →
                  </button>
                </div>
              </div>
            )}

            {/* Year Selection */}
            {years.length > 0 && (
              <div id="year-selection" className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Select Financial Years</h2>
                  <div className="flex gap-3 text-xs">
                    <button onClick={handleSelectAllYears} className="text-[#ff7010] hover:underline">All</button>
                    <button onClick={handleClearYears} className="text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {years.map((yr) => {
                    const checked = selectedYears.includes(yr)
                    return (
                      <button
                        key={yr}
                        onClick={() => toggleYear(yr)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          checked
                            ? 'bg-[#ff7010] border-[#ff7010] text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-[#ff7010] hover:text-[#ff7010]'
                        }`}
                      >
                        {checked ? <FaCheckSquare className="text-xs" /> : <FaSquare className="text-xs opacity-30" />}
                        {yr}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Report Type Selection */}
            {reportTypes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Select Report Types</h2>
                  <div className="flex gap-3 text-xs">
                    <button onClick={handleSelectAllTypes} className="text-[#ff7010] hover:underline">All</button>
                    <button onClick={handleClearTypes} className="text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reportTypes.map((rt) => {
                    const checked = selectedTypes.includes(rt.key)
                    return (
                      <button
                        key={rt.key}
                        onClick={() => toggleType(rt.key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                          checked
                            ? 'bg-orange-50 border-[#ff7010] text-[#ff7010]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-[#ff7010] hover:text-[#ff7010]'
                        }`}
                      >
                        <FaFileAlt className={`flex-shrink-0 ${checked ? 'text-[#ff7010]' : 'text-gray-300'}`} />
                        <span className="font-medium">{rt.label}</span>
                        {checked && <FaCheckSquare className="ml-auto text-[#ff7010] flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary + Payment */}
          <div className="space-y-5">

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Selected Years */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">Financial Years</p>
                {effectiveYears.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">None selected</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {effectiveYears.map((yr) => (
                      <span key={yr} className="text-xs bg-orange-50 text-[#ff7010] border border-orange-100 px-2 py-0.5 rounded-full">{yr}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Types */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1.5">Report Types</p>
                {effectiveTypes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">None selected</p>
                ) : (
                  <div className="space-y-1">
                    {effectiveTypes.map((key) => {
                      const rt = reportTypes.find((r) => r.key === key)
                      return (
                        <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <FaCheckSquare className="text-[#ff7010] flex-shrink-0" />
                          {rt ? rt.label : key}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{effectiveYears.length} year{effectiveYears.length !== 1 ? 's' : ''} × ₹{PRICE_PER_YEAR}</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base mt-2">
                  <span>Total</span>
                  <span className="text-[#ff7010]">₹{totalAmount}</span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff7010] focus:ring-1 focus:ring-[#ff7010]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff7010] focus:ring-1 focus:ring-[#ff7010]"
                />
              </div>

              {/* Pay Button */}
              {isAuthenticated ? (
                <button
                  onClick={handlePay}
                  disabled={paying || effectiveYears.length === 0}
                  className="w-full bg-[#ff7010] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#e06000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${totalAmount}`
                  )}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-[#ff7010] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#e06000] transition-colors"
                >
                  <FaLock className="text-xs" />
                  Login to Buy
                </Link>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">
                Reports will be emailed after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-gray-700 font-medium truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  </div>
)

export default SmartReportDetail