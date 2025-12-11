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
import LineChart from '../components/LineChart'

const DealDetails = () => {
  const location = useLocation()
  const { id } = useParams()
  const [currentUrl, setCurrentUrl] = useState('')

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

  const deal = contents?.deals?.[0]
  const deals = contents?.deals.slice(1) || []

  // Prepare share data
  const shareTitle = deal?.title || 'Check this out!'
  const shareDescription =
    deal?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''
  const shareImage = deal?.imageUrl || ''

  const sanitizeDesc = (desc) => {
    return DOMPurify.sanitize(desc)
  }

  // Social sharing handlers
  // const handleWhatsAppShare = () => {
  //   const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`)
  //   const url = encodeURIComponent(currentUrl)
  //   window.open(
  //     `https://wa.me/?text=${text}%20${url}`,
  //     '_blank',
  //     'noopener,noreferrer'
  //   )
  // }

  // const handleFacebookShare = () => {
  //   const url = encodeURIComponent(currentUrl)
  //   window.open(
  //     `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  //     '_blank',
  //     'noopener,noreferrer'
  //   )
  // }

  // const handleTwitterShare = () => {
  //   const text = encodeURIComponent(shareTitle)
  //   const url = encodeURIComponent(currentUrl)
  //   window.open(
  //     `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  //     '_blank',
  //     'noopener,noreferrer'
  //   )
  // }

  // const handleLinkedInShare = () => {
  //   const url = encodeURIComponent(currentUrl)
  //   window.open(
  //     `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  //     '_blank',
  //     'noopener,noreferrer'
  //   )
  // }


  // Create dynamic full text for sharing
const fullShareText = `${deal?.title}\n\n${shareDescription}\n\n${currentUrl}`

// WhatsApp
const handleWhatsAppShare = () => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
    "_blank"
  );
};

// Facebook
const handleFacebookShare = () => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    "_blank"
  );
};

// Twitter
const handleTwitterShare = () => {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(deal?.title)}&url=${encodeURIComponent(currentUrl)}`,
    "_blank"
  );
};

// LinkedIn
const handleLinkedInShare = () => {
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    "_blank"
  );
};


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
        <title>
          {deal?.title} | {dealTitle} Company
        </title>
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
          <div className="flex justify-start items-start text-[15px]">
            <Link to={`/${path}`} className="font-aptos-bold whitespace-nowrap">
              {dealTitle}
            </Link>
            <FaArrowRight className="border-l-2 text-[#ff7010] mx-1 mt-1" />
            <p className="font-aptos-regular">{deal?.title}</p>
          </div>
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
            <div className="mt-6">
              <h3 className="font-aptos-semibold text-[15px] text-white bg-gray-500 w-fit px-2 py-1 rounded">
                {deal?.brandName}
              </h3>
              <h1 className="font-aptos-bold text-3xl mt-2 text-[#ff7010]">
                {deal?.title}
              </h1>

              <div className="mt-2 w-full h-[450px]">
                <img
                  src={deal?.imageUrl}
                  alt="image"
                  className="w-full h-full object-cover object-center rounded"
                />
              </div>

              {/* social share */}
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="font-aptos-regular text-sm">
                    by {deal?.writtenBy || 'Team DSJ'}
                  </p>
                  <p className="font-aptos-regular text-sm">
                    {handleDate(deal.createdAt)}
                  </p>
                </div>
                <div className="flex gap-4 text-xl mr-2">
                  {/* WhatsApp */}
                  <button
                    onClick={handleWhatsAppShare}
                    aria-label="Share on WhatsApp"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FaWhatsapp className="text-[#25D366] hover:text-[#ff7010] transition-all duration-300" />
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
                className="font-aptos-regular text-lg mt-2"
                dangerouslySetInnerHTML={{
                  __html: sanitizeDesc(deal?.description),
                }}
              ></p>
            </div>

            <div className="mt-10 sm:mt-0">
              <div className="sticky top-10">
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
                {!deal?.hideInfoBox && (
                  <>
                    <CompanyProfileSection
                      brandName={deal?.brandName}
                      companyLogoUrl={deal?.companyLogoUrl}
                      companyName={deal?.companyName}
                      ebitda={deal?.ebitda}
                      grossRevenue={deal?.grossRevenue}
                      industry={deal?.industry}
                      netProfitLoss={deal?.netProfitLoss}
                      yearIncorporation={deal?.yearIncorporation}
                    />

                    <hr className="text-[#ff7010] my-5" />
                  </>
                )}
                {/* line chart */}
                {!deal?.hideGraph && (
                  <LineChart
                    title={deal?.brandName}
                    grossRevenueData={deal?.grossRevenueData}
                    grossYear={deal?.grossYear}
                    grossExpensesData={deal?.grossExpensesData}
                    revenueColor="#ff7010"
                    expensesColor="#6366f1"
                  />
                )}

                {/* competitor line chart */}
                {!deal?.hideCompetitorGraph && (
                  <LineChart
                    title={deal?.competitorBrandName}
                    grossRevenueData={deal?.grossCompetitorRevenueData}
                    grossYear={deal?.grossYear}
                    grossExpensesData={deal?.grossCompetitorExpensesData}
                    revenueColor="red"
                    expensesColor="blue"
                  />
                )}

                {deals.map((content) => (
                  <DealsSubCard
                    key={content.id}
                    deal={dealTitle}
                    id={content.id}
                    url={`/${content.deals}/${content.id}`}
                    image={content.imageUrl}
                    heading={content.title}
                    date={content.createdAt}
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
