// import React, { useEffect, useState, useRef } from 'react'
// import {
//   FaCaretDown,
//   FaWhatsapp,
//   FaFacebook,
//   FaXTwitter,
//   FaLinkedin,
// } from 'react-icons/fa6'
// import { TbSeparator } from 'react-icons/tb'
// import { Link, useLocation, useParams } from 'react-router-dom'
// import spinner from '../assets/spinner.png'
// import DsjInsight from '../components/DsjInsight'
// import CompanyProfileSection from '../components/CompanyProfileSection'
// import DealsSubCard from '../components/DealsSubCard'
// import { useQuery } from '@tanstack/react-query'
// import { fetchDealById } from '../api/dealApi'
// import DOMPurify from 'dompurify'
// import { handleDate } from '../handleDate'
// import { Helmet } from 'react-helmet-async'
// import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa'
// import FundRaiseChart from '../components/FundRaiseChart'
// import FinancialChart from '../components/FinancialChart'
// import DetailsDealsSubCard from '../components/DetailsDealsSubCard'
// import SmartImage from '../components/SmartImage'

// const DealDetails = () => {
//   const location = useLocation()
//   const { id } = useParams()
//   const [currentUrl, setCurrentUrl] = useState('')
//   const [finalHtml, setFinalHtml] = useState('')
//   const [graph, setGraph] = useState()
//   const [showGraph, setShowGraph] = useState(true)
//   const [visibleSidebarCards, setVisibleSidebarCards] = useState(0)
//   const path = location.pathname.split('/')[1].toLowerCase()

//   const leftColRef = useRef(null)
//   const rightColRef = useRef(null)

//   // Get current URL after component mounts
//   useEffect(() => {
//     setCurrentUrl(window.location.href)
//   }, [])

//   // Mapping
//   const dealTypeMap = {
//     preseed: 'Pre seed',
//     seed: 'Seed',
//     growth: 'Growth',
//     ma: 'M&A',
//     ipo: 'IPO',
//     world: 'World',
//   }

//   const dealTitle = dealTypeMap[path] || ''

//   const {
//     isPending,
//     isError,
//     data: contents,
//     error,
//   } = useQuery({
//     queryKey: ['dealDetails', path, id],
//     queryFn: () => fetchDealById(path, id),
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   })

//   const deal = contents?.singleDeal
//   const deals = contents?.deals

//   const dealSorted = deals?.sort(
//     (a, b) => new Date(b.articleDate) - new Date(a.articleDate)
//   )

//   const deal4Article = dealSorted?.slice(0, 4)

//   // useEffect(() => {
//   //   if (deal && window.__sharethis__) {
//   //     setTimeout(() => {
//   //       window.__sharethis__.initialize()
//   //     }, 500)
//   //   }
//   // }, [deal])

//   // Calculate available space and determine number of cards to show
//   useEffect(() => {
//     const calculateVisibleCards = () => {
//       if (!leftColRef.current || !rightColRef.current) return

//       const leftHeight = leftColRef.current.scrollHeight
//       const rightHeight = rightColRef.current.scrollHeight

//       const remainingSpace = leftHeight - rightHeight
//       // console.log('leftHeight', leftHeight)
//       // console.log('rightHeight', rightHeight)
//       // console.log('reamingSpace', remainingSpace)
//       const cardHeight = 150
//       const cardsToShow = Math.floor(remainingSpace / cardHeight)

//       setVisibleSidebarCards(
//         Math.max(0, Math.min(cardsToShow, dealSorted?.length || 0))
//       )
//     }

//     const timer = setTimeout(calculateVisibleCards, 2000)
//     window.addEventListener('resize', calculateVisibleCards)

//     return () => {
//       clearTimeout(timer)
//       window.removeEventListener('resize', calculateVisibleCards)
//     }
//   }, [deal, graph, showGraph])

//   const handleGraph = (brandName) => {
//     const selected = deal?.competitorGrossGraph?.find(
//       (compe) => compe.brandName === brandName
//     )
//     setGraph(selected)
//   }

//   useEffect(() => {
//     if (deal?.competitorGrossGraph?.length > 0) {
//       handleGraph(deal.competitorGrossGraph[0].brandName)
//     } else {
//       setGraph(null)
//     }
//   }, [deal])

//   // Prepare share data
//   const shareTitle = deal?.title || 'Check this out!'
//   const shareDescription =
//     deal?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''
//   const shareImage = deal?.imageUrl || ''

//   // show image at center when click
//   function showPopup(src) {
//     const popup = document.createElement('div')

//     popup.style.position = 'fixed'
//     popup.style.top = '0'
//     popup.style.left = '0'
//     popup.style.width = '100vw'
//     popup.style.height = '100vh'
//     popup.style.background = 'rgba(0,0,0,0.7)'
//     popup.style.display = 'flex'
//     popup.style.alignItems = 'center'
//     popup.style.justifyContent = 'center'
//     popup.style.zIndex = '9999'

//     popup.innerHTML = `
//     <img src="${src}" style="max-width:90%; max-height:90%; border-radius:6px;" />
//   `

//     popup.addEventListener('click', () => popup.remove())

//     document.body.appendChild(popup)
//   }

//   // handle image border and first letter bold and bigger
//   useEffect(() => {
//     if (!deal?.description) return

//     const sanitized = DOMPurify.sanitize(deal.description)

//     const parser = new DOMParser()
//     const doc = parser.parseFromString(sanitized, 'text/html')

//     const firstPara = doc.querySelector('p')

//     if (firstPara) {
//       const walker = document.createTreeWalker(
//         firstPara,
//         NodeFilter.SHOW_TEXT,
//         null,
//         false
//       )

//       const textNode = walker.nextNode()
//       if (textNode && textNode.nodeValue.trim().length > 0) {
//         const originalText = textNode.nodeValue
//         const firstChar = originalText.trim().charAt(0)

//         // remove only first visible character
//         textNode.nodeValue = originalText.replace(firstChar, '')

//         // create drop cap span
//         const span = document.createElement('span')
//         span.className = 'drop-cap'
//         span.textContent = firstChar

//         // insert before the textNode
//         textNode.parentNode.insertBefore(span, textNode)
//       }
//     }

//     doc.querySelectorAll('img').forEach((img) => {
//       img.style.border = '1px solid lightgray'
//       img.style.borderRadius = '4px'
//       img.style.cursor = 'pointer'
//     })

//     const updatedHtml = doc.body.innerHTML
//     setFinalHtml(updatedHtml)
//   }, [deal])

//   // handle image zoom
//   useEffect(() => {
//     const container = document.getElementById('article-content')

//     if (!container) return

//     // When any element inside container is clicked
//     const handleClick = (e) => {
//       const img = e.target.closest('img')
//       if (img) {
//         showPopup(img.src)
//       }
//     }

//     container.addEventListener('click', handleClick)

//     return () => container.removeEventListener('click', handleClick)
//   }, [finalHtml])

//   // Social sharing handlers
//   // const handleWhatsAppShare = () => {
//   //   const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`)
//   //   const url = encodeURIComponent(currentUrl)
//   //   window.open(
//   //     `https://wa.me/?text=${text}%20${url}`,
//   //     '_blank',
//   //     'noopener,noreferrer'
//   //   )
//   // }

//   // const handleFacebookShare = () => {
//   //   const url = encodeURIComponent(currentUrl)
//   //   window.open(
//   //     `https://www.facebook.com/sharer/sharer.php?u=${url}`,
//   //     '_blank',
//   //     'noopener,noreferrer'
//   //   )
//   // }

//   // const handleTwitterShare = () => {
//   //   const text = encodeURIComponent(shareTitle)
//   //   const url = encodeURIComponent(currentUrl)
//   //   window.open(
//   //     `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
//   //     '_blank',
//   //     'noopener,noreferrer'
//   //   )
//   // }

//   // const handleLinkedInShare = () => {
//   //   const url = encodeURIComponent(currentUrl)
//   //   window.open(
//   //     `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
//   //     '_blank',
//   //     'noopener,noreferrer'
//   //   )
//   // }


//   // Create dynamic full text for sharing
// // ---- SHARE TEXT BUILDER ----
// const fullShareText = `${deal?.title}\n\n${shareDescription}\n\n${currentUrl}`;

// // WhatsApp
// const handleWhatsAppShare = () => {
//   window.open(
//     `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };

// // Facebook
// const handleFacebookShare = () => {
//   window.open(
//     `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };

// // Twitter
// const handleTwitterShare = () => {
//   window.open(
//     `https://twitter.com/intent/tweet?text=${encodeURIComponent(deal?.title)}&url=${encodeURIComponent(currentUrl)}`,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };

// // LinkedIn
// const handleLinkedInShare = () => {
//   window.open(
//     `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };


//   if (isPending) {
//     return (
//       <div className="flex items-center justify-center min-h-[80vh]">
//         <img
//           src={spinner}
//           alt="Loading"
//           loading="lazy"
//           className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
//         />
//       </div>
//     )
//   }

//   if (isError) {
//     return <span>Error: {error.message}</span>
//   }

//   return (
//     <>
//       <Helmet>
//         <title>{deal?.brandName} Article</title>
//         <meta name="description" content={shareDescription} />
//         <meta property="og:title" content={shareTitle} />
//         <meta property="og:description" content={shareDescription} />
//         <meta property="og:image" content={shareImage} />
//         <meta property="og:url" content={currentUrl} />
//         <meta property="og:type" content="article" />
//         <meta property="og:site_name" content="DSJ" />
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={shareTitle} />
//         <meta name="twitter:description" content={shareDescription} />
//         <meta name="twitter:image" content={shareImage} />
//         <meta name="twitter:site" content="@yourtwitterhandle" />
//       </Helmet>

//       <div className="bg-slate-50 pb-5 w-full mx-auto">
//         <div className="bg-gray-200 h-48">
//           <div className="max-w-6xl mx-auto h-full"></div>
//         </div>

//         <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
//           <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
//             <div ref={leftColRef} className="h-fit">
//               <div className="flex justify-start items-start text-[15px]">
//                 <Link
//                   to={`/${path}`}
//                   className="font-aptos-bold whitespace-nowrap"
//                 >
//                   {dealTitle}
//                 </Link>
//                 <TbSeparator className="mx-1 mt-1" />
//                 <p className="font-aptos-regular">{deal?.title}</p>
//               </div>

//               <h3 className="font-aptos-semibold text-[15px] text-white bg-gray-500 w-fit mt-6 px-2 py-1 rounded">
//                 {deal?.brandName}
//               </h3>
//               <h1 className="font-aptos-bold text-3xl my-3 text-[#ff7010]">
//                 {deal?.title}
//               </h1>

//               <SmartImage src={deal?.imageUrl} alt={deal?.brandName} />

//               <p className="italic font-aptos-regular text-sm text-gray-400">
//                 Image Credit: {deal?.pcCredit || 'Deal Street Journal'}
//               </p>

//               <hr className="text-orange-400 mt-5" />

//               {/* social share */}
//               <div className="flex justify-between items-center mt-2">
//                 <div>
//                   <p className="flex justify-start items-center gap-1 font-aptos-semibold text-regular text-gray-800">
//                     <FaUserCircle /> {deal?.writtenBy || 'Team DSJ'}
//                   </p>
//                   <p className="flex justify-start items-center gap-1 font-aptos-semibold text-sm text-gray-500">
//                     <FaCalendarAlt />
//                     {handleDate(deal.articleDate)}
//                   </p>
//                 </div>
//                 {/* <div className="flex gap-4 mr-2"> */}
//                 {/* <div class="sharethis-inline-share-buttons"></div> */}

//                 {/* <button
//                     onClick={handleWhatsAppShare}
//                     aria-label="Share on WhatsApp"
//                     title="Share on WhatsApp"
//                     className="hover:scale-110 transition-transform duration-200"
//                   >
//                     <FaWhatsapp
//                       size={22}
//                       className="text-[#25D366] hover:text-[#ff7010] transition-all duration-300"
//                     />
//                   </button>
//                   <button
//                     onClick={handleFacebookShare}
//                     aria-label="Share on Facebook"
//                     title="Share on Facebook"
//                     className="hover:scale-110 transition-transform duration-200"
//                   >
//                     <FaFacebook className="text-[#1877F2] hover:text-[#ff7010] transition-all duration-300" />
//                   </button>
//                   <button
//                     onClick={handleTwitterShare}
//                     aria-label="Share on Twitter"
//                     title="Share on Twitter"
//                     className="hover:scale-110 transition-transform duration-200"
//                   >
//                     <FaXTwitter className="text-black hover:text-[#ff7010] transition-all duration-300" />
//                   </button>
//                   <button
//                     onClick={handleLinkedInShare}
//                     aria-label="Share on LinkedIn"
//                     title="Share on LinkedIn"
//                     className="hover:scale-110 transition-transform duration-200"
//                   >
//                     <FaLinkedin className="text-[#0077B5] hover:text-[#ff7010] transition-all duration-300" />
//                   </button> */}
//                 {/* </div> */}

//                 <div className="flex gap-4 mr-2">

//   <button
//     onClick={handleWhatsAppShare}
//     aria-label="Share on WhatsApp"
//     className="hover:scale-110 transition-transform duration-200"
//   >
//     <FaWhatsapp size={22} className="text-[#25D366]" />
//   </button>

//   <button
//     onClick={handleFacebookShare}
//     aria-label="Share on Facebook"
//     className="hover:scale-110 transition-transform duration-200"
//   >
//     <FaFacebook size={22} className="text-[#1877F2]" />
//   </button>

//   <button
//     onClick={handleTwitterShare}
//     aria-label="Share on Twitter"
//     className="hover:scale-110 transition-transform duration-200"
//   >
//     <FaXTwitter size={22} className="text-black" />
//   </button>

//   <button
//     onClick={handleLinkedInShare}
//     aria-label="Share on LinkedIn"
//     className="hover:scale-110 transition-transform duration-200"
//   >
//     <FaLinkedin size={22} className="text-[#0077B5]" />
//   </button>

// </div>

//               </div>

//               <hr className="text-orange-400 mt-2" />

//               <p
//                 id="article-content"
//                 className="font-aptos-regular text-lg mt-7 text-left"
//                 dangerouslySetInnerHTML={{
//                   __html: finalHtml,
//                 }}
//               ></p>

//               <hr className="text-[#ff7010] my-5" />
//               {(deal?.grossGraphBox || deal?.fundRaiseBox) && (
//                 <div
//                   className={`mb-6 ${
//                     (deal?.grossGraphBox || deal?.fundRaiseBox) &&
//                     'hidden md:grid lg:grid'
//                   }`}
//                 >
//                   <div className="flex items-center mb-5 gap-3">
//                     <h4 className="font-aptos-bold text-gray-800 text-2xl tracking-wide">
//                       Recommended Articles for You
//                     </h4>
//                     <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-800 to-gray-300"></div>
//                   </div>

//                   <div
//                     className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}
//                   >
//                     {deal4Article.map((content) => (
//                       <DetailsDealsSubCard
//                         key={content.id}
//                         deal={dealTitle}
//                         id={content.id}
//                         url={`/${content.deals}/${content.id}`}
//                         image={content.imageUrl}
//                         heading={content.title}
//                         date={content.articleDate}
//                         hide={true}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div ref={rightColRef} className="mt-10 sm:mt-0 h-fit">
//               <div className="flex flex-col justify-center items-center">
//                 <hr className="w-[80%]" />
//                 <h4 className="font-aptos-bold text-2xl text-[#ff7010]">
//                   Unlock Insights
//                 </h4>
//                 <hr className="w-[80%]" />
//                 <FaCaretDown />
//               </div>

//               <DsjInsight />

//               <hr className="text-gray-400 mt-2 mb-4" />

//               {deal?.companyInfoBox && (
//                 <>
//                   <CompanyProfileSection
//                     brandName={deal.companyInfo?.brandName}
//                     companyLogoUrl={deal.companyInfo?.imageUrl}
//                     companyName={deal.companyInfo?.companyName}
//                     ebitda={deal.companyInfo?.ebitda}
//                     grossRevenue={deal.companyInfo?.grossRevenue}
//                     industry={deal.companyInfo?.industry}
//                     netProfitLoss={deal.companyInfo?.netProfitLoss}
//                     yearIncorporation={deal.companyInfo?.yearIncorporation}
//                   />
//                 </>
//               )}

//               {(deal?.grossGraphBox || deal?.fundRaiseBox) && (
//                 <>
//                   <hr className="text-gray-400 my-6" />

//                   <div className="flex justify-start items-center flex-wrap gap-y-3 gap-x-0 mb-5">
//                     {deal?.grossGraphBox && (
//                       <div
//                         onClick={() => setShowGraph(true)}
//                         className={`font-aptos-regular px-3 py-1 rounded-lg w-fit mx-auto cursor-pointer
//        relative border-2   ${
//          showGraph
//            ? 'text-white bg-[#D97706]'
//            : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
//        }
//      `}
//                       >
//                         Financial Performance
//                       </div>
//                     )}

//                     {deal?.fundRaiseBox && (
//                       <div
//                         onClick={() => setShowGraph(false)}
//                         className={`font-aptos-regular px-3 py-1 rounded-lg w-fit mx-auto cursor-pointer
//                   relative border-2 ${
//                     !showGraph
//                       ? 'text-white bg-[#D97706]'
//                       : 'border-gray-500 bg-slate-300 text-slate-700 hover:scale-105 transition-transform duration-300'
//                   }
//      `}
//                       >
//                         Fund Raise
//                       </div>
//                     )}
//                   </div>
//                   {/* <hr className="text-gray-400 my-5" /> */}
//                 </>
//               )}

//               {showGraph && (
//                 <>
//                   {deal?.grossGraphBox && (
//                     <>
//                       <FinancialChart
//                         title={deal.grossGraph?.brandName}
//                         heading="Financial Performance Analysis"
//                         labels={deal.grossGraph?.grossYear
//                           ?.split(',')
//                           .map((y) => y.trim())}
//                         datasets={[
//                           {
//                             label: 'Gross Operational Revenue',
//                             data: deal.grossGraph?.grossRevenueData
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#ff7010',
//                             backgroundColor: 'rgba(255,112,16)',
//                             tension: 0.3,
//                           },
//                           {
//                             label: 'Gross Expenses',
//                             data: deal.grossGraph?.grossExpensesData
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#6366f1',
//                             backgroundColor: 'rgba(99,102,241)',
//                             tension: 0.3,
//                           },
//                           {
//                             label: 'Other Income',
//                             data: deal.grossGraph?.otherIncome
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#0D9488',
//                             backgroundColor: '#0D9488',
//                             tension: 0.3,
//                           },
//                         ]}
//                       />
//                       <hr className="text-gray-400 my-5" />
//                     </>
//                   )}
//                   {deal?.competitorGrossGraph?.length > 0 && (
//                     <h5 className="text-gray-700 font-aptos-bold text-[20px] text-center mb-2">
//                       Compare Financial Performance
//                     </h5>
//                   )}

//                   <div className="flex justify-start items-center flex-wrap gap-2">
//                     {deal?.competitorGrossGraph &&
//                       deal.competitorGrossGraph.length > 0 &&
//                       deal.competitorGrossGraph.map((compe) => (
//                         <p
//                           key={compe?.brandName}
//                           onClick={() => handleGraph(compe?.brandName)}
//                           className={`px-2 py-1 rounded-lg  font-aptos-semibold  w-fit cursor-pointer ${
//                             graph?.brandName == compe?.brandName
//                               ? 'text-orange-800 bg-orange-200 border border-orange-800'
//                               : 'text-gray-500 bg-slate-300'
//                           }`}
//                         >
//                           {compe?.brandName}
//                         </p>
//                       ))}
//                   </div>
//                   <br></br>
//                   {graph && (
//                     <>
//                       <FinancialChart
//                         competitor="true"
//                         title={graph?.brandName}
//                         heading="Financial Performance Analysis"
//                         labels={graph?.grossYear
//                           ?.split(',')
//                           .map((y) => y.trim())}
//                         datasets={[
//                           {
//                             label: 'Gross Operational Revenue',
//                             data: graph?.grossRevenueData
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#ff7010',
//                             backgroundColor: 'rgba(255,112,16)',
//                             tension: 0.3,
//                           },
//                           {
//                             label: 'Gross Expenses',
//                             data: graph?.grossExpensesData
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#6366f1',
//                             backgroundColor: 'rgba(99,102,241)',
//                             tension: 0.3,
//                           },
//                           {
//                             label: 'Other Income',
//                             data: graph?.otherIncome
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#0D9488',
//                             backgroundColor: '#0D9488',
//                             tension: 0.3,
//                           },
//                         ]}
//                       />
//                       <hr className="text-gray-400 my-5" />
//                     </>
//                   )}
//                 </>
//               )}

//               {!showGraph && (
//                 <>
//                   {deal?.fundRaiseBox && (
//                     <>
//                       <FundRaiseChart
//                         title={`${deal.fundRaise?.brandName}`}
//                         heading="Overview of Fund Raising"
//                         labels={deal.fundRaise?.fundRaiseYear
//                           ?.split(',')
//                           .map((y) => y.trim())}
//                         datasets={[
//                           {
//                             label: 'Fund Raise Amount',
//                             data: deal.fundRaise?.fundRaiseAmount
//                               ?.split(',')
//                               .map((v) => parseFloat(v) || 0),
//                             borderColor: '#ff7010',
//                             backgroundColor: 'rgba(255,112,16)',
//                             tension: 0.3,
//                           },
//                         ]}
//                         fundRaiseRound={deal.fundRaise?.fundRaiseRound}
//                       />
//                     </>
//                   )}
//                 </>
//               )}

//               {/* Dynamically show DealsSubCard based on available space */}
//               <div>
//                 {dealSorted
//                   ?.slice(
//                     0,
//                     window.innerWidth < 768
//                       ? dealSorted.length
//                       : visibleSidebarCards
//                   )
//                   .map((content) => (
//                     <DealsSubCard
//                       key={content.id}
//                       deal={dealTitle}
//                       id={content.id}
//                       url={`/${content.deals}/${content.id}`}
//                       image={content.imageUrl}
//                       heading={content.title}
//                       date={content.articleDate}
//                       hide={true}
//                     />
//                   ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default DealDetails



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

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

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
  const deals = contents?.deals?.slice(1) || []

  const shareTitle = deal?.title || 'Check this out!'
  const shareDescription =
    deal?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''
  const shareImage = deal?.imageUrl || ''

  const sanitizeDesc = (desc) => DOMPurify.sanitize(desc)

  // ----------------------- FIXED SHARE -----------------------
  const encodedURL = encodeURIComponent(currentUrl)
  const encodedText = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`)
  const encodedImage = encodeURIComponent(shareImage)

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodedText}%0A${encodedURL}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`,
      '_blank'
    )
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`,
      '_blank'
    )
  }

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`,
      '_blank'
    )
  }
  // -----------------------------------------------------------

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

  if (isError) return <span>Error: {error.message}</span>

  return (
    <>
      <Helmet>
        <title>{deal?.title} | {dealTitle} Company</title>
        <meta name="description" content={shareDescription} />

        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImage} />
      </Helmet>

      <div className="bg-slate-50 pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48"></div>

        <div className="max-w-6xl w-[90%] mx-auto py-5">
          <div className="flex items-start text-[15px]">
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
                  alt={deal?.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* SHARE BUTTONS */}
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-sm">by {deal?.writtenBy || 'Team DSJ'}</p>
                  <p className="text-sm">{handleDate(deal.createdAt)}</p>
                </div>

                <div className="flex gap-4 text-xl mr-2">
                  <button onClick={handleWhatsAppShare}><FaWhatsapp className="text-[#25D366]" /></button>
                  <button onClick={handleFacebookShare}><FaFacebook className="text-[#1877F2]" /></button>
                  <button onClick={handleTwitterShare}><FaXTwitter /></button>
                  <button onClick={handleLinkedInShare}><FaLinkedin className="text-[#0077B5]" /></button>
                </div>
              </div>

              <hr className="border-orange-400 mt-2" />

              <p
                className="text-lg mt-2"
                dangerouslySetInnerHTML={{ __html: sanitizeDesc(deal?.description) }}
              ></p>
            </div>

            <div className="mt-10">
              <div className="sticky top-10">
                <DsjInsight />

                {!deal?.hideInfoBox && (
                  <>
                    <CompanyProfileSection {...deal} />
                    <hr className="my-5" />
                  </>
                )}

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

                {deals.map((content) => (
                  <DealsSubCard
                    key={content.id}
                    deal={dealTitle}
                    id={content.id}
                    url={`/${path}/${content.id}`}
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
