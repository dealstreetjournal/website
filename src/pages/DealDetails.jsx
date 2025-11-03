import React, { useEffect, useState } from 'react'
import {
  FaArrowRight,
  FaCaretDown,
  FaWhatsapp,
  FaFacebook,
  FaXTwitter,
  FaLinkedin,
} from 'react-icons/fa6'
import { Link, useLocation, useParams } from 'react-router-dom'
import spinner from '../assets/spinner.png'
import DsjInsight from '../components/DsjInsight'
import CompanyProfileSection from '../components/CompanyProfileSection'
import DealsSubCard from '../components/DealsSubCard'
import { useQuery } from '@tanstack/react-query'
import { fetchDealById } from '../api/dealApi'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'
import { Helmet } from 'react-helmet-async'
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa'
import FundRaiseChart from '../components/FundRaiseChart'
import FinancialChart from '../components/FinancialChart'
import DetailsDealsSubCard from '../components/DetailsDealsSubCard'
import SmartImage from '../components/SmartImage'

const DealDetails = () => {
  const location = useLocation()
  const { id } = useParams()
  const [currentUrl, setCurrentUrl] = useState('')
  const [graph, setGraph] = useState()
  const [showGraph, setShowGraph] = useState(true)
  const path = location.pathname.split('/')[1].toLowerCase()

  // Get current URL after component mounts
  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

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
    queryKey: ['dealDetails', path, id],
    queryFn: () => fetchDealById(path, id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const deal = contents?.singleDeal
  const deals = contents?.deals

  const dealSorted = deals?.sort(
    (a, b) => new Date(b.articleDate) - new Date(a.articleDate)
  )

  const deal4Article = dealSorted?.slice(0, 4)

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
      setGraph(null) // Reset when no graph data
    }
  }, [deal])

  console.log('competitorGraph', graph)

  // Prepare share data
  const shareTitle = deal?.title || 'Check this out!'
  const shareDescription =
    deal?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''
  const shareImage = deal?.imageUrl || ''

  const sanitizeDesc = (desc) => {
    if (!desc) {
      return ''
    }

    // 1. Sanitize the description using DOMPurify
    const sanitized = DOMPurify.sanitize(desc)

    // 2. Create a temporary element to parse the HTML string
    const tempElement = document.createElement('div')
    tempElement.innerHTML = sanitized

    // 3. Find the first span tag within the parsed HTML
    const firstPara = tempElement.querySelector('p')

    if (firstPara) {
      // 4. Get the first letter of the span's text content
      const originalText = firstPara.textContent
      const firstLetter = originalText.charAt(0)

      // 5. Check if the first character is a letter
      if (/[a-zA-Z]/.test(firstLetter)) {
        // 6. Create a new span for the styled first letter
        const styledLetter = document.createElement('span')
        styledLetter.style.fontSize = '3.3em'
        styledLetter.style.fontWeight = 'bold'
        styledLetter.style.color = '#ff7010'
        styledLetter.style.float = 'left'
        styledLetter.style.lineHeight = '1'
        styledLetter.style.paddingRight = '10px'
        styledLetter.textContent = firstLetter

        // 7. Replace the original first letter with the styled one

        const remainingText = originalText.slice(1)
        firstPara.innerHTML = styledLetter.outerHTML + remainingText
      }
    }

    // 8. Return the modified HTML string
    return tempElement.innerHTML
  }

  // Social sharing handlers
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`)
    const url = encodeURIComponent(currentUrl)
    window.open(
      `https://wa.me/?text=${text}%20${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleFacebookShare = () => {
    const url = encodeURIComponent(currentUrl)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareTitle)
    const url = encodeURIComponent(currentUrl)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(currentUrl)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <>
      <Helmet>
        <title>{deal?.brandName} Article</title>
        <meta name="description" content={shareDescription} />

        {/* Open Graph tags */}
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="DSJ" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImage} />
        <meta name="twitter:site" content="@yourtwitterhandle" />
      </Helmet>

      <div className=" bg-slate-50 pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
            <div className="">
              <div className="flex justify-start items-start text-[15px]">
                <Link
                  to={`/${path}`}
                  className="font-aptos-bold whitespace-nowrap"
                >
                  {dealTitle}
                </Link>
                <FaArrowRight className="border-l-2 text-[#ff7010] mx-1 mt-1" />
                <p className="font-aptos-regular">{deal?.title}</p>
              </div>

              <h3 className="font-aptos-semibold text-[15px] text-white bg-gray-500 w-fit mt-6 px-2 py-1 rounded">
                {deal?.brandName}
              </h3>
              <h1 className="font-aptos-bold text-3xl mt-2 text-[#ff7010]">
                {deal?.title}
              </h1>

              {/* <div className="flex justify-center items-center mt-2 w-full h-[450px] bg-slate-200 border-2 border-slate-400 rounded-md overflow-hidden">
                <img
                  src={deal?.imageUrl}
                  alt={deal?.brandName || 'Deal Image'}
                  loading="lazy"
                  className="w-full h-full object-contain object-center"
                />
              </div> */}

              <SmartImage src={deal?.imageUrl} alt={deal?.brandName} />

              <p className="italic font-aptos-regular text-sm text-gray-400">
                Image Credit: {deal?.pcCredit || 'Deal Street Journal'}
              </p>

              <hr className="border-orange-400 border mt-5" />

              {/* social share */}
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
                <div className="flex gap-4 text-xl mr-2">
                  {/* WhatsApp */}
                  <button
                    onClick={handleWhatsAppShare}
                    aria-label="Share on WhatsApp"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FaWhatsapp
                      size={22}
                      className="text-[#25D366] hover:text-[#ff7010] transition-all duration-300"
                    />
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={handleFacebookShare}
                    aria-label="Share on Facebook"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FaFacebook className="text-[#1877F2] hover:text-[#ff7010] transition-all duration-300" />
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={handleTwitterShare}
                    aria-label="Share on Twitter"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FaXTwitter className="text-black hover:text-[#ff7010] transition-all duration-300" />
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={handleLinkedInShare}
                    aria-label="Share on LinkedIn"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FaLinkedin className="text-[#0077B5] hover:text-[#ff7010] transition-all duration-300" />
                  </button>
                </div>
              </div>
              {/* social share */}

              <hr className="border-orange-400 border mt-2" />

              <p
                className="font-aptos-regular text-lg mt-7 text-left"
                dangerouslySetInnerHTML={{
                  __html: sanitizeDesc(deal?.description),
                }}
              ></p>

              <div className="w-full my-8 border-t-2 border-[#ff7010]"></div>
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
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}
                  >
                    {deal4Article.map((content) => (
                      <DetailsDealsSubCard
                        key={content.id}
                        deal={dealTitle}
                        id={content.id}
                        url={`/${content.deals}/${content.id}`}
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

            <div className="mt-10 sm:mt-0">
              {/* <div className=""> */}
              <div className="flex flex-col justify-center items-center">
                <hr className="w-[80%]" />
                <h4 className="font-aptos-bold text-2xl text-[#ff7010]">
                  Unlock Insights
                </h4>
                <hr className="w-[80%]" />
                <FaCaretDown />
              </div>

              {/* dsj-insight */}
              <DsjInsight />

              <hr className="text-[#ff7010] mt-2 mb-4" />

              {deal?.companyInfoBox && (
                <>
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

                  {/* <hr className="text-[#ff7010] my-5" /> */}
                </>
              )}

              {(deal?.grossGraphBox || deal?.fundRaiseBox) && (
                <>
                  <div className="w-full my-5 border-t-3 border-[#ff7010]"></div>

                  <div className="flex justify-start items-center flex-wrap gap-y-3 gap-x-0">
                    {deal?.grossGraphBox && (
                      <div
                        onClick={() => setShowGraph(true)}
                        className={`font-aptos-regular px-3 py-1 rounded-lg w-fit mx-auto cursor-pointer
       relative border-2   ${
         showGraph
           ? 'text-orange-800 border-orange-500 bg-gray-300 animate-[glowBorder_4s_ease-in-out_infinite]'
           : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
       }
     `}
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
                      ? 'text-orange-800 border-orange-500 bg-gray-300 animate-[glowBorder_4s_ease-in-out_infinite]'
                      : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
                  }
     `}
                      >
                        Fund Raise
                      </div>
                    )}
                  </div>
                  <div className="w-full my-5 border-t-3 border-[#ff7010]"></div>
                </>
              )}

              {showGraph && (
                <>
                  {deal?.grossGraphBox && (
                    <>
                      {/* <div className="w-full my-5 border-t-3 border-[#ff7010]"></div> */}
                      <FinancialChart
                        title={deal.grossGraph?.brandName}
                        heading="Financial Performance Analysis"
                        // subHeading="Revenue vs Expenses vs Income Overview"
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
                      <hr className="text-[#ff7010] my-5" />
                    </>
                  )}
                  {deal?.competitorGrossGraph?.length > 0 && (
                    <h5 className="text-gray-700 font-aptos-bold text-center mb-1">
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
                          className={`px-2 py-1 rounded-lg  font-aptos-semibold  w-fit cursor-pointer ${
                            graph?.brandName == compe?.brandName
                              ? 'text-orange-800 bg-orange-200 border border-orange-800'
                              : 'text-gray-500 bg-slate-300'
                          }`}
                        >
                          {compe?.brandName}
                        </p>
                      ))}
                  </div>
                  <br></br>
                  {/* competitor */}
                  {graph && (
                    <>
                      <FinancialChart
                        competitor="true"
                        title={graph?.brandName}
                        heading="Financial Performance Analysis"
                        // subHeading="Revenue vs Expenses vs Income Overview"
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
                            // borderColor: '#0D9488',
                            // backgroundColor: 'rgba(13,148,136)',
                            borderColor: '#0D9488',
                            backgroundColor: '#0D9488',
                            tension: 0.3,
                          },
                        ]}
                      />
                    </>
                  )}
                </>
              )}

              {/* fundRasie chart */}
              {!showGraph && (
                <>
                  {deal?.fundRaiseBox && (
                    <>
                      {/* <div className="w-full my-5 border-t-3 border-[#ff7010]"></div> */}
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
                    </>
                  )}
                </>
              )}

              {/* </div> */}
              {/* {!deal?.grossGraphBox && !deal?.fundRaiseBox && ( */}
              <div>
                {dealSorted.map((content) => (
                  <DealsSubCard
                    key={content.id}
                    deal={dealTitle}
                    id={content.id}
                    url={`/${content.deals}/${content.id}`}
                    image={content.imageUrl}
                    heading={content.title}
                    date={content.articleDate}
                    hide={true}
                  />
                ))}
              </div>
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DealDetails
