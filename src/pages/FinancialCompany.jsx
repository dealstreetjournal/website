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

  const [modalPdf, setModalPdf] = useState(null)

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
  const availableYears = data?.availableYears || []
  const companyInfo = financialData[0]
  const samples = data?.samplePdf || []

  return (
    <div className="bg-slate-50 pb-5 w-full mx-auto">
      <div className="bg-gray-200 h-48">
        <div className="max-w-6xl mx-auto h-full"></div>
      </div>

      <div className="max-w-6xl mx-auto w-[90%]">
        {showPopup && <Popup onClose={() => setShowPopup(false)} />}

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
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded-md px-2 py-2 border-slate-200 focus:border-[#cc5c00] focus:ring-0 focus:outline-none focus:shadow-2xl"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {financialData.map((report) => {
            const pdf = samples.find(
              (sample) =>
                normalize(sample.title) === normalize(report.reportTitle)
            )?.pdf

            return (
              <FinancialCompanyCard
                key={report.id}
                report={report}
                samplePdf={pdf}
                openPdf={() => setModalPdf(pdf)}
              />
            )
          })}
        </div>
      </div>

      {/* ---------------------- PDF MODAL ---------------------- */}
      {modalPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalPdf(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-xl font-semibold text-black">PDF Preview</h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold hover:rotate-90 transition-transform cursor-pointer"
                onClick={() => setModalPdf(null)}
              >
                ×
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={`${modalPdf}#toolbar=0`}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------------------------------- */}
    </div>
  )
}

export default FinancialCompany
