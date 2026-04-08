import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { fetchFinancial } from '../api/dsjApi'
import FinancialCompanyCard from '../components/FinancialCompanyCard'
import Popup from '../components/Popup'

const FinancialCompany = () => {
  const location = useLocation()
  const { companyName } = location.state || {}

  document.title = `${companyName} | DealStreetJournal`

  const [year, setYear] = useState('')
  const { id } = useParams()
  const [showPopup, setShowPopup] = useState(false)

  // PDF modal states (Same style as SamplePdf)
  const [showModal, setShowModal] = useState(false)
  const [pdfSrc, setPdfSrc] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])

  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ')

  useEffect(() => {
    const popup = sessionStorage.getItem('popupShown')
    if (!popup) {
      setShowPopup(true)
      sessionStorage.setItem('popupShown', 'true')
    }
  }, [])

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['financial', id, year],
    queryFn: () => fetchFinancial(id, year),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // console.log('financial query data', data)

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          loading="lazy"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  const financialData = data?.data
  // console.log('financialData', financialData)
  const availableYears = data?.availableYears || []
  const companyInfo = financialData[0]
  const samples = data?.samplePdf || []

  const openPdfPreview = (url) => {
    setPdfSrc(url)

    if (isMobile) {
      window.open(url, '_blank')
    } else {
      setShowModal(true)
    }
  }

  const closePdfModal = () => {
    setShowModal(false)
    setPdfSrc('')
  }

  // Separate reports
  const bottomReports = financialData.filter(
    (report) =>
      report.reportTitle.trim() === 'Investor Metrics' ||
      report.reportTitle.trim() === 'Return on Investment Analysis'
  )

  // console.log('bottomReports', bottomReports)

  const normalReports = financialData.filter(
    (report) =>
      report.reportTitle.trim() !== 'Investor Metrics' &&
      report.reportTitle.trim() !== 'Return on Investment Analysis'
  )

  // console.log('normalReports', normalReports)

  return (
    <div className="bg-[#F8F9FA] pb-5 w-full mx-auto">
      {/* Header */}
      <div className="bg-gray-200 h-48">
        <div className="max-w-6xl mx-auto h-full"></div>
      </div>

      <div className="max-w-6xl mx-auto w-[90%]">
        {showPopup && <Popup onClose={() => setShowPopup(false)} />}

        {/* Breadcrumb */}
        <div className="font-aptos-semibold flex justify-start mt-5">
          <Link
            to="/financial"
            className="text-black hover:text-slate-700 whitespace-nowrap transition-all duration-300"
          >
            Financial Insight
          </Link>

          <Link
            to={`/financial/${id}`}
            className="text-[#ff7010] hover:text-[#cc5200] transition-all duration-300"
          >
            &nbsp;/&nbsp;{companyInfo.company} Financial Information
          </Link>
        </div>

        {/* Header Row */}
        <div className="mt-5 flex justify-between items-center">
          <div className="flex-col md:flex-row md:gap-2 items-end">
            <img
              src={companyInfo.image}
              alt={companyInfo.company}
              loading="lazy"
              className="w-15 h-auto rounded-md"
            />
            <h3 className="font-aptos-bold text-xl">{companyInfo.company}</h3>
          </div>

          <div className="font-aptos-semibold flex-col md:flex-row justify-center items-center md:gap-2">
            <p className="mb-2 md:mb-0">Financial Year</p>
            <select
              value={year || financialData[0]?.financialYear}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded-md px-2 py-2 border-slate-200 focus:border-[#cc5c00] focus:ring-0"
            >
              <option value="">Select</option>
              {availableYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {normalReports.map((report) => {
            const pdf = samples?.find(
              (sample) =>
                normalize(sample.title) === normalize(report.reportTitle)
            )?.pdf
            return (
              <FinancialCompanyCard
                key={report.id}
                report={report}
                samplePdf={pdf}
                openPdf={() => openPdfPreview(pdf)}
              />
            )
          })}

          {/* Bottom Cards */}
          {bottomReports.map((report) => {
            const pdf = samples.find(
              (sample) =>
                normalize(sample.title) === normalize(report.reportTitle)
            )?.pdf

            return (
              <div key={report.id} className="bg-orange-500/20 p-2 rounded-lg">
                <FinancialCompanyCard
                  report={report}
                  samplePdf={pdf}
                  openPdf={() => openPdfPreview(pdf)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------- UNIVERSAL PDF MODAL (DESKTOP ONLY) ---------- */}
      {!isMobile && showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closePdfModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-xl font-semibold text-black">PDF Preview</h5>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold hover:rotate-90 transition-transform cursor-pointer"
                onClick={closePdfModal}
              >
                ×
              </button>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
              <iframe
                src={`${pdfSrc}#toolbar=0`}
                className="w-full h-[600px] pb-15 border-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialCompany
