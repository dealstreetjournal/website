import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { FaShoppingCart, FaSearch, FaChevronRight } from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { fetchSearch } from '../api/homeApi'
import { hasAiAccess } from '../utils/aiAccess'

const NavbarDesktop = () => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { cartCount } = useCart()
  const { user } = useAuth()
  const location = useLocation()

  // Debounce the search input with 5 seconds delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 2000) // Changed to 5 seconds

    return () => clearTimeout(handler)
  }, [search])

  // Call useQuery with the debounced value
  const { data, isError, isPending, error } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => fetchSearch(debouncedSearch),
    enabled: !!debouncedSearch && debouncedSearch.trim().length > 0, // Only fetch if search has content
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // console.log('Search results:', data)

  // Show search results when data is available or when there's an error
  useEffect(() => {
    if (debouncedSearch && (data || isError)) {
      setShowSearchResults(true)
    }
  }, [data, isError, debouncedSearch])

  const handleMouseEnter = (dropdown) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setActiveDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    // Set a delay before hiding the dropdown
    const id = setTimeout(() => {
      setActiveDropdown(null)
    }, 300) // 300ms delay
    setTimeoutId(id)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearch(value)

    // Hide previous search results when user starts typing again
    if (showSearchResults) {
      setShowSearchResults(false)
    }

    // If input is cleared, reset everything
    if (!value.trim()) {
      setDebouncedSearch('')
      setShowSearchResults(false)
    }
  }

  const closeSearchResults = () => {
    setShowSearchResults(false)
  }

  useEffect(() => {
    setActiveDropdown(null)
    setDebouncedSearch('')
    setShowSearchResults(false)
    setSearch('')
  }, [location.pathname])

  const renderSearchResults = () => {
    if (!showSearchResults || !debouncedSearch) return null

    // if (isPending) {
    //   return (
    //     <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[450px] z-50">
    //       <div className="flex items-center justify-center py-4">
    //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7010]"></div>
    //         <span className="ml-3 text-gray-600 font-aptos-semibold">
    //           Searching...
    //         </span>
    //       </div>
    //     </div>
    //   )
    // }

    if (isError) {
      return (
        <div className="absolute top-full right-0 mt-2 bg-white border border-red-200 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[450px] z-50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-500 font-aptos-bold text-sm">!</span>
              </div>
              <h3 className="text-lg font-semibold text-red-600">
                Search Error
              </h3>
            </div>
            <button
              onClick={closeSearchResults}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl font-light"
            >
              <RxCross2 />
            </button>
          </div>
          <p className="text-red-600 ml-11">
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      )
    }

    // Check if no data found
    const hasResults =
      data &&
      ((data.deals && data.deals.length > 0) ||
        (data.latest && data.latest.length > 0) ||
        data.company ||
        data.fundingCompany)

    if (!hasResults) {
      return (
        <div className="absolute top-full right-0 mt-5 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[450px] z-50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <h3 className="text-lg font-aptos-semibold text-gray-700">
                No Results Found
              </h3>
            </div>
            <button
              onClick={closeSearchResults}
              className="text-gray-400 hover:text-gray-600 hover:rotate-90 cursor-pointer transition-all duration-300 text-xl font-aptos-light"
            >
              <RxCross2 />
            </button>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">
              No results found for "
              <span className="font-aptos-semibold text-gray-700">
                {debouncedSearch}
              </span>
              "
            </p>
            <p className="text-sm text-gray-400">
              Try different keywords or check spelling
            </p>
          </div>
        </div>
      )
    }

    // Render search results
    return (
      <div className="absolute top-full right-0 mt-5 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 min-w-[400px] max-w-[550px] z-50 max-h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#ff7010] bg-opacity-10 rounded-full flex items-center justify-center mr-3">
              <FaSearch className="text-[#ff7010] text-sm" />
            </div>
            <h3 className="text-lg font-aptos-semibold text-gray-800">
              Search Results
            </h3>
          </div>
          <button
            onClick={closeSearchResults}
            className="text-gray-400 cursor-pointer hover:text-gray-600 hover:rotate-90 transition-all duration-300 text-xl font-aptos-light"
          >
            <RxCross2 />
          </button>
        </div>

        <div className="space-y-5">
          {/* Deals Results */}
          {data.deals && data.deals.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-1 h-5 bg-[#ff7010] rounded-full mr-3"></div>
                <h4 className="font-aptos-semibold text-gray-700 text-base">
                  Deals{' '}
                  <span className="text-sm text-gray-500 font-aptos-normal">
                    ({data.deals.length} found)
                  </span>
                </h4>
              </div>
              <div className="space-y-2 ml-4">
                {data.deals.map((deal, index) => (
                  <Link
                    to={`/${deal?.deals}/${deal.slug}`}
                    key={index}
                    className="block p-4 border border-gray-100 rounded-lg hover:border-[#ff7010] hover:bg-orange-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <h5 className="font-aptos-semibold text-sm text-[#ff7010] transition-colors duration-200 mb-1">
                          {deal?.brandName || 'Untitled Deal'}
                        </h5>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {deal?.title}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-aptos-semibold">
                          {deal?.deals}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest Results */}
          {data.latest && data.latest.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full mr-3"></div>
                <h4 className="font-aptos-semibold text-gray-700 text-base">
                  Latest Deal&nbsp;
                </h4>
                <span className="text-sm text-gray-500 font-aptos-normal">
                  ({data.latest.length} found)
                </span>
              </div>
              {/* <div className="ml-4">
                <Link
                  to="/latest"
                  state={{ query: debouncedSearch, time: 500 }}
                  className="block p-4 border border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <h5 className="font-aptos-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors duration-200 mb-1">
                    {data.latest[0].companyName || 'Untitled'}
                  </h5>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {data.latest[0].fundingDetails ||
                      'Latest funding insights and updates'}
                  </p>
                </Link>
              </div> */}

              <div className="space-y-2 ml-4">
                {data.latest.map((lat) => (
                  <Link
                    to="/latest"
                    state={{ query: debouncedSearch, time: 500 }}
                    key={lat.id}
                    className="block p-4 border border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                  >
                    <h5 className="font-aptos-semibold text-sm text-blue-600 transition-colors duration-200 mb-1">
                      {lat.companyName || 'Untitled'}
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {lat.fundingDetails ||
                        'Latest funding insights and updates'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Funding Company Results - Funding 365 */}
          {data.fundingCompany && (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
                <h4 className="font-aptos-semibold text-gray-700 text-base">
                  Funding 365
                </h4>
              </div>
              <div className="ml-4">
                <Link
                  to={`/funding/${data.fundingCompany.slug}`}
                  className="block p-4 border border-gray-100 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-aptos-semibold text-sm text-purple-600 transition-colors duration-200 mb-1">
                        {data.fundingCompany.companyName || 'Funding Company'}
                      </h5>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        Access in-depth annual fundraising reports on startups,
                        featuring key valuation metrics like EV/EBITDA and
                        EV/Gross Revenue, detailed cap tables with exact
                        shareholding, and insights into new lead investors
                        across funding rounds. Each report covers all
                        fundraising activity during the financial year — round
                        by round, investor by investor.
                      </p>
                    </div>
                    <div className="ml-3">
                      <FaChevronRight className="text-gray-400 group-hover:text-purple-500 text-sm transition-colors duration-200" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Company Results - Financial Insights */}
          {data.company && (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-1 h-5 bg-green-500 rounded-full mr-3"></div>
                <h4 className="font-aptos-semibold text-gray-700 text-base">
                  Financial Insights
                </h4>
              </div>
              <div className="ml-4">
                <Link
                  to={`/financial/${data.company.slug}`}
                  className="block p-4 border border-gray-100 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-aptos-semibold text-sm text-green-600 transition-colors duration-200 mb-1">
                        {data.company?.companyName || 'Company Financial Data'}
                      </h5>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        Access financial statements, financial performance and
                        margin analysis, ratio analysis and expenses analysis
                        reports.
                      </p>
                    </div>
                    <div className="ml-3">
                      <FaChevronRight className="text-gray-400 line-clamp-2 group-hover:text-green-500 text-sm transition-colors duration-200" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="font-aptos-semibold h-23 flex justify-between items-center fixed top-0 z-50 bg-white w-full border-b-2 border-[#ff7010]">
        <Link to="/" className="ml-2">
          <img
            src={logo}
            alt="dealstreetjournal"
            loading="lazy"
            className="mix-blend-multiply sm:w-[250px] xl:w-[350px] h-auto"
          />
        </Link>

        <nav className="font-aptos-bold flex justify-center items-center sm:text-sm sm:gap-5 sm:mr-5 lg:gap-8 lg:mr-10 xl:gap-11 xl:mr-32">
          {/* Deals Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter('deals')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#ff7010] transition-colors">
              <span>Deals</span>
              <FaChevronRight
                className={`text-xs transition-transform duration-200 ${
                  activeDropdown === 'deals' ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* Deals Submenu */}
            {activeDropdown === 'deals' && (
              <div className="text-sm absolute top-full left-0 mt-1 bg-white border-2 border-[#ff7010] rounded-lg shadow-lg py-2 min-w-[100px] z-50">
                <Link
                  to="/preseed"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Pre Seed
                </Link>
                <Link
                  to="/seed"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Seed
                </Link>
                <Link
                  to="/growth"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Growth
                </Link>
                <Link
                  to="/ma"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  M&A
                </Link>
                <Link
                  to="/ipo"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  IPO
                </Link>
              </div>
            )}
          </div>

          {/* IPO */}
          <Link
            to="/world"
            className="cursor-pointer hover:text-[#ff7010] transition-colors"
          >
            <span>World</span>
          </Link>

          {/* World */}
          <Link
            to="/blog"
            className="cursor-pointer hover:text-[#ff7010] transition-colors"
          >
            <span>Opinion</span>
          </Link>

          {/* DSJ Insights Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter('insights')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#ff7010] transition-colors">
              <Link to="/dsj-insight" className="whitespace-nowrap">
                DSJ Insights
              </Link>
              <FaChevronRight
                className={`text-xs transition-transform duration-200 ${
                  activeDropdown === 'insights' ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* DSJ Insights Submenu */}
            {activeDropdown === 'insights' && (
              <div className="text-sm absolute top-full left-0 mt-1 bg-white border-2 border-[#ff7010] rounded-lg shadow-lg py-2 min-w-[150px] z-50">
                <Link
                  to="/latest"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Latest Deal
                </Link>
                <Link
                  to="/funding"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Funding365
                </Link>
                <Link
                  to="/financial"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#ff7010] transition-colors"
                >
                  Financial Insights
                </Link>

              </div>
            )}
          </div>

          {hasAiAccess(user) && (
            <>
              {/* DSJ AI Report */}
              <Link
                to="/smart-reports"
                className="cursor-pointer hover:text-[#ff7010] transition-colors whitespace-nowrap"
              >
                DSJ AI Report
              </Link>

              {/* DSJ AI */}
              <Link
                to="/company-ai"
                className="cursor-pointer hover:text-[#ff7010] transition-colors whitespace-nowrap"
              >
                DSJ AI
              </Link>

              {/* Jobs -- not ready to go live to everyone yet, gated behind
                  the same access-list check as DSJ AI until then. */}
              <Link
                to="/jobs"
                className="cursor-pointer hover:text-[#ff7010] transition-colors whitespace-nowrap"
              >
                Jobs
              </Link>
            </>
          )}

          {/* Shopping Cart */}
          <Link
            to="/cart"
            className="relative flex justify-center items-center hover:text-gray-600 transition-colors"
          >
            <FaShoppingCart className="text-[20px]" />

            {/* Cart count badge */}
            {cartCount > 0 ? (
              <p className="absolute -top-1 -right-2 bg-[#ff7010] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </p>
            ) : (
              <p className="absolute -top-1 -right-2 bg-[#ff7010] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                0
              </p>
            )}
          </Link>

          {/* Login */}
          <Link
            to={user ? '/user' : '/login'}
            className="bg-black text-white px-4 rounded py-1 hover:bg-gray-500 transition-colors"
          >
            {user ? <span>{user.slice(0, 4)}...</span> : <span>Login</span>}
          </Link>

          {/* search */}
          <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter('search')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="cursor-pointer hover:text-[#ff7010] transition-colors">
              <FaSearch />
            </div>

            {activeDropdown === 'search' && (
              <div className="absolute right-0 mt-5 border bg-white border-black rounded shadow-lg min-w-[200px] z-50 animate-[slideDown_0.3s_ease-out]">
                <div className="m-1 flex justify-center items-center gap-2">
                  <input
                    type="search"
                    value={search}
                    onChange={handleSearchInputChange}
                    autoComplete="off"
                    autoCorrect="off"
                    placeholder="search..."
                    className="border-2 border-[#ff7010] font-aptos-semibold tracking-wide rounded p-2 bg-white w-full"
                  />
                  {isPending && debouncedSearch && (
                    <div className="animate-spin rounded-full h-8 w-8 mx-2 border-b-2 border-[#ff7010]"></div>
                  )}
                </div>
              </div>
            )}

            {/* Search Results Overlay */}
            {renderSearchResults()}
          </div>
        </nav>
      </div>

      {/* Backdrop to close search results when clicking outside */}
      {showSearchResults && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={closeSearchResults}
        />
      )}
    </>
  )
}

export default NavbarDesktop
