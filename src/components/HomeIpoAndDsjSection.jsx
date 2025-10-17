import React from 'react'
import DsjInsight from './DsjInsight'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'

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
                  className="font-aptos-semibold line-clamp-3 md:line-clamp-5 xl:line-clamp-4 mb-1 md:mb-4 xl:mb-1"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescription(ipo[0]?.description),
                  }}
                ></p>
                <img
                  src={ipo[0].imageUrl}
                  alt="image"
                  className="rounded-md w-full h-58 md:h-68 xl:h-78 object-cover"
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
