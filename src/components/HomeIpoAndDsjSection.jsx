import React from 'react'
import DsjInsight from './DsjInsight'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'

const HomeIpoAndDsjSection = ({ data }) => {
  const ipo = data || []

  const sanitizeDescription = (desc) => {
    const sanitizeDesc = DOMPurify.sanitize(desc)
    return sanitizeDesc
  }

  return (
    <>
      <div className="w-full bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto w-[90%] grid grid-cols-1 sm:grid-cols-[60%_40%] gap-8 md:gap-4 lg:gap-8">
          {/* ipo-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              IPO
            </h1>
            {ipo && ipo.length > 0 && (
              <Link to={`ipo/${ipo[0].id}`} className="mb-5">
                <p
                  className="font-aptos-semibold line-clamp-2 md:line-clamp-4 xl:line-clamp-3 mb-1 md:mb-4 xl:mb-1"
                  title={ipo[0]?.title}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescription(ipo[0]?.description),
                  }}
                ></p>

                <div className="flex justify-between items-top mt-2 font-aptos-regular text-sm text-gray-700">
                  <p className="text-orange-700 font-aptos-semibold">
                    {ipo[0]?.brandName}
                  </p>
                  <p className="whitespace-nowrap">
                    {handleDate(ipo[0]?.articleDate)}
                  </p>
                </div>

                <img
                  src={ipo[0].imageUrl}
                  alt={ipo[0]?.title}
                  loading="lazy"
                  className="rounded-md w-full h-58 md:h-68 xl:h-78 object-cover object-center"
                />
              </Link>
            )}
            <hr className="text-[#ff7010] mt-2" />
          </div>

          {/* dsj-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              DSJ Insights
            </h1>
            <DsjInsight />
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeIpoAndDsjSection
