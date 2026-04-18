import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { FaCaretDown } from 'react-icons/fa6'
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa'

import { TbSeparator } from 'react-icons/tb'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  WhatsappShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
} from 'react-share'
import spinner from '../assets/spinner.png'
import DsjInsight from '../components/DsjInsight'
import CompanyProfileSection from '../components/CompanyProfileSection'
import DealsSubCard from '../components/DealsSubCard'
import { useQuery } from '@tanstack/react-query'
import { fetchDealById } from '../api/dealApi'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'
import FundRaiseChart from '../components/FundRaiseChart'
import FinancialChart from '../components/FinancialChart'
import DetailsDealsSubCard from '../components/DetailsDealsSubCard'
import SmartImage from '../components/SmartImage'
import ErrorPage from './ErrorPages'

const DealDetails = () => {
  const location = useLocation()
  const { slug } = useParams()
  const [currentUrl, setCurrentUrl] = useState('')
  const [finalHtml, setFinalHtml] = useState('')
  const [graph, setGraph] = useState()
  const [showGraph, setShowGraph] = useState(true)
  const [visibleSidebarCards, setVisibleSidebarCards] = useState(0)
  const path = location.pathname.split('/')[1].toLowerCase()

  const leftColRef = useRef(null)
  const unlockRef = useRef(null)
  const companyRef = useRef(null)
  const fundRaiseChartRef = useRef(null)
  const compareBoxRef = useRef(null)
  const BoxRef = useRef(null)

  // Get current URL after component mounts
  useEffect(() => {
    setCurrentUrl(`https://web.dealstreetjournal.com/dsj/deal/${path}/${slug}`)
  }, [path, slug])

  // Mapping
  const dealTypeMap = {
    preseed: 'Pre seed',
    seed: 'Seed',
    growth: 'Growth',
    ma: 'M&A',
    ipo: 'IPO',
    world: 'World',
  }

  const dealTitle = dealTypeMap[path] || ''

  const {
    isPending,
    isError,
    data: contents,
    error,
  } = useQuery({
    queryKey: ['dealDetails', path, slug],
    queryFn: () => fetchDealById(path, slug),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const deal = contents?.singleDeal
  const deals = contents?.deals

  const dealSorted = deals?.sort(
    (a, b) => new Date(b.articleDate) - new Date(a.articleDate)
  )

  const deal4Article = dealSorted?.slice(0, 4)

  // Calculate available space and determine number of cards to show
  const getHeightIfVisible = (ref) => {
    if (!ref?.current) return 0

    const el = ref.current
    const style = window.getComputedStyle(el)

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      el.offsetParent === null
    ) {
      return 0
    }

    return el.scrollHeight || 0
  }

  useLayoutEffect(() => {
    if (!leftColRef.current) return

    const calculate = () => {
      const leftHeight = leftColRef.current.scrollHeight

      const sidebarHeight =
        getHeightIfVisible(unlockRef) +
        getHeightIfVisible(companyRef) +
        getHeightIfVisible(fundRaiseChartRef) +
        getHeightIfVisible(compareBoxRef) +
        getHeightIfVisible(BoxRef)

      const remainingSpace = leftHeight - sidebarHeight
      const cardHeight = 150

      const cardsToShow =
        Math.floor(remainingSpace / cardHeight) +
        ((deal?.grossGraphBox || deal?.fundRaiseBox) && 4)

      setVisibleSidebarCards((prev) =>
        prev === cardsToShow ? prev : Math.max(0, cardsToShow)
      )
    }

    const ro = new ResizeObserver(calculate)

    ro.observe(leftColRef.current)
    unlockRef.current && ro.observe(unlockRef.current)
    companyRef.current && ro.observe(companyRef.current)
    fundRaiseChartRef.current && ro.observe(fundRaiseChartRef.current)
    compareBoxRef.current && ro.observe(compareBoxRef.current)
    BoxRef.current && ro.observe(BoxRef.current)

    window.addEventListener('resize', calculate)
    calculate()

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calculate)
    }
  }, [dealSorted, showGraph, deal])

  const handleGraph = (brandName) => {
    const selected = deal?.competitorGrossGraph?.find(
      (compe) => compe.brandName === brandName
    )
    setGraph(selected)
  }

  useEffect(() => {
    if (deal?.competitorGrossGraph?.length > 0) {
      handleGraph(deal.competitorGrossGraph[0].brandName)
    } else {
      setGraph(null)
    }
  }, [deal])

  // Show image at center when clicked
  function showPopup(src) {
    const popup = document.createElement('div')

    popup.style.position = 'fixed'
    popup.style.top = '0'
    popup.style.left = '0'
    popup.style.width = '100vw'
    popup.style.height = '100vh'
    popup.style.background = 'rgba(0,0,0,0.7)'
    popup.style.display = 'flex'
    popup.style.alignItems = 'center'
    popup.style.justifyContent = 'center'
    popup.style.zIndex = '9999'

    popup.innerHTML = `
      <img src="${src}" style="max-width:90%; max-height:90%; border-radius:6px;" />
    `

    popup.addEventListener('click', () => popup.remove())

    document.body.appendChild(popup)
  }

  // Handle image border and first letter bold and bigger
  useEffect(() => {
    if (!deal?.description) return

    const sanitized = DOMPurify.sanitize(deal.description)

    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized, 'text/html')

    const firstPara = doc.querySelector('p')

    if (firstPara) {
      const walker = document.createTreeWalker(
        firstPara,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )

      const textNode = walker.nextNode()
      if (textNode && textNode.nodeValue.trim().length > 0) {
        const originalText = textNode.nodeValue
        const firstChar = originalText.trim().charAt(0)

        // Remove only first visible character
        textNode.nodeValue = originalText.replace(firstChar, '')

        // Create drop cap span
        const span = document.createElement('span')
        span.className = 'drop-cap'
        span.textContent = firstChar

        // Insert before the textNode
        textNode.parentNode.insertBefore(span, textNode)
      }
    }

    doc.querySelectorAll('img').forEach((img) => {
      img.style.border = '1px solid lightgray'
      img.style.borderRadius = '4px'
      img.style.cursor = 'pointer'
    })

    const updatedHtml = doc.body.innerHTML
    setFinalHtml(updatedHtml)
  }, [deal])

  // Handle image zoom
  useEffect(() => {
    const container = document.getElementById('article-content')

    if (!container) return

    // When any element inside container is clicked
    const handleClick = (e) => {
      const img = e.target.closest('img')
      if (img) {
        showPopup(img.src)
      }
    }

    container.addEventListener('click', handleClick)

    return () => container.removeEventListener('click', handleClick)
  }, [finalHtml])

  // Prepare share data
  const shareTitle = deal?.title || 'Check this out!'
  const shareDescription =
    deal?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''

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
    return <ErrorPage data={error.message} />
  }

  return (
    <>
      <div className="bg-slate-50 pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
            {/* LEFT SIDE */}
            <div ref={leftColRef} className="h-fit">
              <div className="flex justify-start items-start text-[15px]">
                <Link
                  to={`/${path}`}
                  className="font-aptos-bold whitespace-nowrap"
                >
                  {dealTitle}
                </Link>
                <TbSeparator className="mx-1 mt-1" />
                <p className="font-aptos-regular">{deal?.title}</p>
              </div>

              <h3 className="font-aptos-semibold text-[15px] text-white bg-gray-500 w-fit mt-6 px-2 py-1 rounded">
                {deal?.brandName}
              </h3>
              <h1 className="font-aptos-bold text-3xl my-3 text-[#ff7010]">
                {deal?.title}
              </h1>

              <SmartImage src={deal?.imageUrl} alt={deal?.brandName} />

              <p className="italic font-aptos-regular text-sm text-gray-400">
                Image Credit: {deal?.pcCredit || 'Deal Street Journal'}
              </p>

              <hr className="text-orange-400 mt-5" />

              {/* SOCIAL SHARE with react-share */}
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="flex justify-start items-center gap-1 font-aptos-semibold text-regular text-gray-800">
                    <FaUserCircle /> {deal?.writtenBy || 'Team DSJ'}
                  </p>
                  <p className="flex justify-start items-center gap-1 font-aptos-semibold text-sm text-gray-500">
                    <FaCalendarAlt />
                    {handleDate(deal.articleDate)}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  {/* WhatsApp Share */}
                  <WhatsappShareButton
                    url={currentUrl}
                    title={shareTitle}
                    separator=" - "
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>

                  {/* Twitter Share */}
                  <TwitterShareButton
                    url={currentUrl}
                    title={shareTitle}
                    hashtags={['DealStreetJournal', 'Startup']}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  {/* LinkedIn Share */}
                  <LinkedinShareButton
                    url={currentUrl}
                    title={shareTitle}
                    summary={shareDescription}
                    source="Deal Street Journal"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>

                  {/* Copy Link Button */}
                  <FacebookShareButton
                    url={currentUrl}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                </div>
              </div>

              <hr className="text-orange-400 mt-2" />

              {/* ARTICLE CONTENT */}
              <p
                id="article-content"
                className="font-aptos-regular text-lg mt-7 text-left"
                dangerouslySetInnerHTML={{
                  __html: finalHtml,
                }}
              ></p>

              <hr className="text-[#ff7010] my-5" />

              {/* RECOMMENDED ARTICLES */}
              {(deal?.grossGraphBox || deal?.fundRaiseBox) && (
                <div
                  className={`mb-6 ${
                    (deal?.grossGraphBox || deal?.fundRaiseBox) &&
                    'hidden md:grid lg:grid'
                  }`}
                >
                  <div className="flex items-center mb-5 gap-3">
                    <h4 className="font-aptos-bold text-gray-800 text-2xl tracking-wide">
                      Recommended Articles for You
                    </h4>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-800 to-gray-300"></div>
                  </div>

                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6`}
                  >
                    {deal4Article.map((content) => (
                      <DetailsDealsSubCard
                        key={content.id}
                        deal={dealTitle}
                        id={content.id}
                        url={`/${content.deals}/${content.slug}`}
                        image={content.imageUrl}
                        heading={content.title}
                        date={content.articleDate}
                        hide={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="mt-10 sm:mt-0 h-fit">
              <div ref={unlockRef}>
                <div className="flex flex-col justify-center items-center">
                  <hr className="w-[80%]" />
                  <h4 className="font-aptos-bold text-2xl text-[#ff7010]">
                    Unlock Insights
                  </h4>
                  <hr className="w-[80%]" />
                  <FaCaretDown />
                </div>

                <DsjInsight />

                <hr className="text-gray-400 mt-2 mb-4" />
              </div>

              {/* COMPANY PROFILE */}
              {deal?.companyInfoBox && (
                <div ref={companyRef}>
                  <CompanyProfileSection
                    brandName={deal.companyInfo?.brandName}
                    companyLogoUrl={deal.companyInfo?.imageUrl}
                    companyName={deal.companyInfo?.companyName}
                    ebitda={deal.companyInfo?.ebitda}
                    grossRevenue={deal.companyInfo?.grossRevenue}
                    industry={deal.companyInfo?.industry}
                    netProfitLoss={deal.companyInfo?.netProfitLoss}
                    yearIncorporation={deal.companyInfo?.yearIncorporation}
                  />
                </div>
              )}

              {/* TOGGLE BUTTONS */}
              {(deal?.grossGraphBox || deal?.fundRaiseBox) && (
                <div ref={BoxRef}>
                  <hr className="text-gray-400 my-6" />

                  <div className="flex justify-start items-center flex-wrap gap-y-3 gap-x-0 mb-5">
                    {deal?.grossGraphBox && (
                      <div
                        onClick={() => setShowGraph(true)}
                        className={`font-aptos-regular px-3 py-1 rounded-lg w-fit mx-auto cursor-pointer
                          relative border-2 ${
                            showGraph
                              ? 'text-white bg-[#D97706]'
                              : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
                          }`}
                      >
                        Financial Performance
                      </div>
                    )}

                    {deal?.fundRaiseBox && (
                      <div
                        onClick={() => setShowGraph(false)}
                        className={`font-aptos-regular px-3 py-1 rounded-lg w-fit mx-auto cursor-pointer
                          relative border-2 ${
                            !showGraph
                              ? 'text-white bg-[#D97706]'
                              : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
                          }`}
                      >
                        Fund Raise
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FINANCIAL CHARTS */}
              {showGraph && (
                <div ref={compareBoxRef}>
                  {deal?.grossGraphBox && (
                    <>
                      <FinancialChart
                        title={deal.grossGraph?.brandName}
                        heading="Financial Performance Analysis"
                        labels={deal.grossGraph?.grossYear
                          ?.split(',')
                          .map((y) => y.trim())}
                        datasets={[
                          {
                            label: 'Gross Operational Revenue',
                            data: deal.grossGraph?.grossRevenueData
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#ff7010',
                            backgroundColor: 'rgba(255,112,16)',
                            tension: 0.3,
                          },
                          {
                            label: 'Gross Expenses',
                            data: deal.grossGraph?.grossExpensesData
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99,102,241)',
                            tension: 0.3,
                          },
                          {
                            label: 'Other Income',
                            data: deal.grossGraph?.otherIncome
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#0D9488',
                            backgroundColor: '#0D9488',
                            tension: 0.3,
                          },
                        ]}
                      />
                      <hr className="text-gray-400 my-5" />
                    </>
                  )}

                  {/* COMPETITOR COMPARISON */}
                  {deal?.competitorGrossGraph?.length > 0 && (
                    <h5 className="text-gray-700 font-aptos-bold text-[20px] text-center mb-2">
                      Compare Financial Performance
                    </h5>
                  )}

                  <div className="flex justify-start items-center flex-wrap gap-2">
                    {deal?.competitorGrossGraph &&
                      deal.competitorGrossGraph.length > 0 &&
                      deal.competitorGrossGraph.map((compe) => (
                        <p
                          key={compe?.brandName}
                          onClick={() => handleGraph(compe?.brandName)}
                          className={`px-2 py-1 rounded-lg font-aptos-semibold w-fit cursor-pointer ${
                            graph?.brandName == compe?.brandName
                              ? 'text-orange-800 bg-orange-200 border border-orange-800'
                              : 'text-gray-500 bg-slate-300'
                          }`}
                        >
                          {compe?.brandName}
                        </p>
                      ))}
                  </div>
                  <br />

                  {graph && (
                    <>
                      <FinancialChart
                        competitor="true"
                        title={graph?.brandName}
                        heading="Financial Performance Analysis"
                        labels={graph?.grossYear
                          ?.split(',')
                          .map((y) => y.trim())}
                        datasets={[
                          {
                            label: 'Gross Operational Revenue',
                            data: graph?.grossRevenueData
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#ff7010',
                            backgroundColor: 'rgba(255,112,16)',
                            tension: 0.3,
                          },
                          {
                            label: 'Gross Expenses',
                            data: graph?.grossExpensesData
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99,102,241)',
                            tension: 0.3,
                          },
                          {
                            label: 'Other Income',
                            data: graph?.otherIncome
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#0D9488',
                            backgroundColor: '#0D9488',
                            tension: 0.3,
                          },
                        ]}
                      />
                      <hr className="text-gray-400 my-5" />
                    </>
                  )}
                </div>
              )}

              {/* FUND RAISE CHART */}
              {!showGraph && (
                <>
                  {deal?.fundRaiseBox && (
                    <div ref={fundRaiseChartRef}>
                      <FundRaiseChart
                        title={`${deal.fundRaise?.brandName}`}
                        heading="Overview of Fund Raising"
                        labels={deal.fundRaise?.fundRaiseYear
                          ?.split(',')
                          .map((y) => y.trim())}
                        datasets={[
                          {
                            label: 'Fund Raise Amount',
                            data: deal.fundRaise?.fundRaiseAmount
                              ?.split(',')
                              .map((v) => parseFloat(v) || 0),
                            borderColor: '#ff7010',
                            backgroundColor: 'rgba(255,112,16)',
                            tension: 0.3,
                          },
                        ]}
                        fundRaiseRound={deal.fundRaise?.fundRaiseRound}
                      />
                    </div>
                  )}
                </>
              )}

              {/* SIDEBAR DEALS */}
              <div>
                {dealSorted
                  ?.slice(
                    deal?.grossGraphBox || deal?.fundRaiseBox ? 4 : 0,
                    window.innerWidth < 768
                      ? dealSorted.length
                      : visibleSidebarCards
                  )
                  .map((content) => (
                    <DealsSubCard
                      key={content.id}
                      deal={dealTitle}
                      id={content.id}
                      url={`/${content.deals}/${content.slug}`}
                      image={content.imageUrl}
                      heading={content.title}
                      date={content.articleDate}
                      hide={true}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DealDetails
