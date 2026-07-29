import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import {
  FaShoppingCart,
  FaSearch,
  FaChevronRight,
  FaBars,
  FaUser,
} from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { fetchSearch } from '../api/homeApi'
import { useQuery } from '@tanstack/react-query'
import { hasAiAccess } from '../utils/aiAccess'

const NavbarMobile = () => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const location = useLocation()

  const { cartCount } = useCart()
  const { user } = useAuth()

  // Debounce the search input with 5 seconds delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 2000) // Changed to 2 seconds

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

  // Show search results when data is available or when there's an error
  useEffect(() => {
    if (debouncedSearch && (data || isError)) {
      setShowSearchResults(true)
    }
  }, [data, isError, debouncedSearch])

  const handleSubmenuClick = (submenu, e) => {
    e.stopPropagation()
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu)
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

  const closeAllMenus = () => {
    setActiveDropdown(null)
    setActiveSubmenu(null)
  }

  useEffect(() => {
    setActiveDropdown(null)
    setActiveSubmenu(null)
    setSearch('')
    setDebouncedSearch('')
    setShowSearchResults(false)
  }, [location.pathname])

  const renderSearchResults = () => {
    if (!showSearchResults || !debouncedSearch) return null

    if (isError) {
      return (
        <div className="absolute top-full -left-6 mt-20 bg-white border border-red-200 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[450px] z-50">
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
        <div className="absolute top-full -left-6 mt-20 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[450px] z-50">
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
            <p className="text-gray-500 mb-2 font-aptos-semibold">
              No results found for "
              <span className="font-aptos-semibold text-gray-700">
                {debouncedSearch}
              </span>
              "
            </p>
            <p className="text-sm font-aptos-regular text-gray-400">
              Try different keywords or check spelling
            </p>
          </div>
        </div>
      )
    }

    // Render search results
    return (
      <div className="absolute top-full -left-6 mt-20 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-[90vw] z-50 max-h-[500px] overflow-y-auto">
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
                    className="block p-4 border rounded-lg border-[#ff7010] bg-orange-50 transition-all duration-200 cursor-pointer"
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
              <div className="space-y-2 ml-4">
                {data.latest.map((lat) => (
                  <Link
                    to="/latest"
                    state={{ query: debouncedSearch, time: 500 }}
                    key={lat.id}
                    className="block p-4 border rounded-lg border-blue-500 bg-blue-50 transition-all duration-200 cursor-pointer"
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
                  className="block p-4 border rounded-lg border-purple-500 bg-purple-50 transition-all duration-200 cursor-pointer"
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
                      <FaChevronRight className="text-purple-500 text-sm transition-colors duration-200" />
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
                  className="block p-4 border rounded-lg border-green-500 bg-green-50 transition-all duration-200 cursor-pointer"
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
                      <FaChevronRight className="line-clamp-2 text-green-500 text-sm transition-colors duration-200" />
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
      <div className="font-aptos-bold text-gray-800 h-18 px-2 flex justify-between items-center fixed top-0 w-full z-50 bg-white border-b-2 border-[#ff7010]">
        {/* bar */}
        <div
          className="relative group"
          onClick={() => {
            setActiveDropdown(activeDropdown === 'bar' ? null : 'bar')
            setActiveSubmenu(null)
          }}
        >
          <FaBars />

          {activeDropdown === 'bar' && (
            <nav className="absolute flex flex-col items-left min-w-[300px] border-t-0 border-2 border-[#ff7010] rounded-b-md bg-[#E2E8F0] top-[45px] gap-5 px-3 py-4 z-40">
              {/* Deals Dropdown */}
              <div
                className="relative group"
                onClick={(e) => handleSubmenuClick('deals', e)}
              >
                <div className="flex items-center justify-between cursor-pointer hover:text-[#ff7010] transition-colors border-b border-gray-600 pb-2 ml-2">
                  <span>Deals</span>
                  <FaChevronRight
                    className={`text-xs transition-transform duration-300 ${
                      activeSubmenu === 'deals' ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Deals Submenu */}
                {activeSubmenu === 'deals' && (
                  <div className="ml-4 mt-1 space-y-1 animate-[fadeIn_0.2s_ease-out] transition-transform duration-500">
                    {[
                      { to: '/preseed', label: 'Pre Seed' },
                      { to: '/seed', label: 'Seed' },
                      { to: '/growth', label: 'growth' },
                      { to: '/ma', label: 'M&A' },
                      { to: '/ipo', label: 'IPO' },
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        onClick={closeAllMenus}
                        className="block whitespace-nowrap text-gray-800 font-aptos-semibold py-2 px-4 hover:bg-gray-100 hover:text-[#ff7010] transition-colors border-b border-gray-500 w-28"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* IPO */}
              <Link
                to="/world"
                onClick={closeAllMenus}
                className="cursor-pointer hover:text-[#ff7010] transition-colors border-b border-gray-600 pb-2 ml-2"
              >
                <span>World</span>
              </Link>

              {/* World */}
              <Link
                to="/blog"
                onClick={closeAllMenus}
                className="cursor-pointer hover:text-[#ff7010] transition-colors border-b border-gray-600 pb-2 ml-2"
              >
                <span>Opinion</span>
              </Link>

              {hasAiAccess(user) && (
                <>
                  {/* DSJ AI Report */}
                  <Link
                    to="/smart-reports"
                    onClick={closeAllMenus}
                    className="cursor-pointer hover:text-[#ff7010] transition-colors border-b border-gray-600 pb-2 ml-2 font-medium whitespace-nowrap"
                  >
                    DSJ AI Report
                  </Link>

                  {/* DSJ AI */}
                  <Link
                    to="/company-ai"
                    onClick={closeAllMenus}
                    className="cursor-pointer hover:text-[#ff7010] transition-colors border-b border-gray-600 pb-2 ml-2 font-medium whitespace-nowrap"
                  >
                    DSJ AI
                  </Link>
                </>
              )}

              {/* DSJ Insights Dropdown */}
              <div
                className="relative group"
                onClick={(e) => handleSubmenuClick('insights', e)}
              >
                <div className="flex items-center justify-between cursor-pointer hover:text-[#ff7010] transition-colors ml-2">
                  <span className="whitespace-nowrap">DSJ Insights</span>
                  <FaChevronRight
                    className={`text-xs transition-transform duration-300 ${
                      activeSubmenu === 'insights' ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* DSJ Insights Submenu */}
                {activeSubmenu === 'insights' && (
                  <div className="ml-4 mt-1 space-y-1 animate-[fadeIn_0.2s_ease-out] transition-transform duration-500">
                    {[
                      { to: '/latest', label: 'Latest Deal' },
                      { to: '/funding', label: 'Funding365' },
                      { to: '/financial', label: 'Financial Insights' },
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        onClick={closeAllMenus}
                        className="block px-4 py-2 whitespace-nowrap text-gray-700 hover:bg-gray-100 hover:text-[#ff7010] transition-colors border-b border-gray-500 w-36"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>

        {/* search */}
        <div className="relative group">
          <div
            className="hover:text-[#ff7010] transition-colors"
            onClick={() => {
              setActiveDropdown(activeDropdown === 'search' ? null : 'search')
              setActiveSubmenu(null)
            }}
          >
            <FaSearch />
          </div>

          {activeDropdown === 'search' && (
            <div
              className="absolute left-0 top-[46px] border bg-white border-black rounded shadow-lg min-w-[250px] mx-auto z-50 animate-[slideDown_0.3s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="m-1 flex justify-center items-center gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={handleSearchInputChange}
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="search..."
                  className="border-2 border-[#ff7010] font-aptos-regular rounded p-1 bg-white w-full"
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

        {/* logo */}
        <Link to="/" onClick={closeAllMenus}>
          <img
            src={logo}
            alt="dealstreetjournal"
            loading="lazy"
            className="mix-blend-multiply w-[200px] h-auto"
          />
        </Link>

        {/* Shopping Cart */}
        <Link
          to="/cart"
          onClick={closeAllMenus}
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
        <Link to={user ? '/user' : '/login'} onClick={closeAllMenus}>
          {user ? <FaUser size={20} color="#ff7010" /> : <FaUser size={20} />}
        </Link>
      </div>

      {/* Backdrop to close search results when clicking outside */}
      {(activeDropdown || showSearchResults) && (
        <div
          className="fixed inset-0 bg-transparent z-30"
          onClick={closeAllMenus}
        />
      )}
    </>
  )
}

export default NavbarMobile
