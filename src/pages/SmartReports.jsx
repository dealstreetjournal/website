import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaSearch, FaBuilding, FaCalendarAlt, FaUser, FaIndustry, FaChevronRight, FaTimes } from 'react-icons/fa'
import spinner from '../assets/spinner.png'
import { fetchFiCompanies } from '../api/fiApi'

const SmartReports = () => {
  document.title = 'AI Generated Report | DealStreetJournal'

  const [inputValue, setInputValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Live search: update debouncedSearch 350ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { isPending, isError, data } = useQuery({
    queryKey: ['fi-companies', debouncedSearch],
    queryFn: () => fetchFiCompanies(debouncedSearch),
    refetchOnWindowFocus: false,
  })

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen py-6">
      <div className="max-w-6xl mx-auto w-[90%]">

        {/* Breadcrumb */}
        <div className="font-semibold flex justify-start space-x-1 mb-6 text-sm">
          <Link to="/dsj-insight" className="text-black hover:text-slate-700 transition-all duration-300">DSJ</Link>
          <span className="text-gray-500">/</span>
          <span className="text-[#ff7010]">DSJ AI Report</span>
        </div>

        {/* Header + Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">DSJ AI Report</h1>
          <p className="text-gray-500 text-sm mb-5">
            Search any company, select the years and report types you need, and get instant AI-generated PDF reports delivered to your email.
          </p>

          {/* Live Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type company name to search..."
              className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff7010] focus:ring-1 focus:ring-[#ff7010] transition-colors"
              autoFocus
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {debouncedSearch && (
            <p className="text-xs text-gray-400 mt-2">
              Showing results for "{debouncedSearch}"
            </p>
          )}
        </div>

        {/* Results */}
        {isPending ? (
          <div className="flex items-center justify-center py-20">
            <img src={spinner} alt="Loading" className="w-10 h-10 animate-spin mix-blend-multiply" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Failed to load companies. Please try again.</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaBuilding className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-lg font-medium">No companies found</p>
            {debouncedSearch && <p className="text-sm mt-1">No results for "{debouncedSearch}"</p>}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data.length} {data.length === 1 ? 'company' : 'companies'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const CompanyCard = ({ company }) => (
  <Link
    to={`/smart-reports/${company.id}`}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#ff7010] transition-all duration-200 group block"
  >
    <div className="flex items-start gap-3 mb-3">
      {company.logoUrl ? (
        <img
          src={company.logoUrl}
          alt={company.companyName}
          className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-gray-50 flex-shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
          <FaBuilding className="text-[#ff7010] text-sm" />
        </div>
      )}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#ff7010] transition-colors line-clamp-2">
          {company.companyName}
        </h3>
      </div>
      <FaChevronRight className="text-gray-300 group-hover:text-[#ff7010] transition-colors mt-1 flex-shrink-0" />
    </div>

    {company.description && (
      <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{company.description}</p>
    )}
    <div className="space-y-1.5 text-xs text-gray-500">
      {company.industry && (
        <div className="flex items-center gap-1.5">
          <FaIndustry className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{company.industry}</span>
        </div>
      )}
      {company.ceo && (
        <div className="flex items-center gap-1.5">
          <FaUser className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{company.ceo}</span>
        </div>
      )}
      {company.cin && (
        <div className="flex items-center gap-1.5">
          <FaBuilding className="flex-shrink-0 text-gray-400" />
          <span className="truncate font-mono">{company.cin}</span>
        </div>
      )}
    </div>

    {company.financialYears && company.financialYears.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <FaCalendarAlt className="text-gray-400 text-xs" />
          <span className="text-xs text-gray-400">Available Years</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {company.financialYears.map((yr) => (
            <span
              key={yr}
              className="text-xs bg-orange-50 text-[#ff7010] border border-orange-100 px-2 py-0.5 rounded-full"
            >
              {yr}
            </span>
          ))}
        </div>
      </div>
    )}
  </Link>
)

export default SmartReports