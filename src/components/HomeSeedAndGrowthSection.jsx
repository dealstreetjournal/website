import React from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'

const HomeSeedAndGrowthSection = ({ seedData, growthData }) => {
  const Seeds = seedData || []
  const growths = growthData || []

  const sanitizeDescription = (desc) => {
    const sanitizeDesc = DOMPurify.sanitize(desc)
    return sanitizeDesc
  }

  return (
    <>
      <div className="w-full bg-slate-200 py-10">
        <div className="max-w-6xl mx-auto w-[90%] grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-4 lg:gap-8">
          {/* seed-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              Seed
            </h1>
            {Seeds && Seeds.length > 0 && (
              <>
                <Link to={`seed/${Seeds[0].id}`} className="relative mb-5">
                  <img
                    src={Seeds[0].imageUrl}
                    alt="image"
                    className="rounded-md w-full h-58 md:h-68 xl:h-78 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-34 bg-gradient-to-t from-black/100 to-transparent rounded-b-md"></div>
                  <p
                    className="absolute bottom-1 text-white font-aptos-regular line-clamp-2 px-2 z-10"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeDescription(Seeds[0]?.description),
                    }}
                  ></p>
                </Link>
                <hr className="text-[#ff7010] mb-7 " />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-3 lg:gap-5">
                  {Seeds &&
                    Seeds.length > 0 &&
                    Seeds.slice(1).map((content) => {
                      return (
                        <Link
                          to={`seed/${content.id}`}
                          key={content.id}
                          className="border-b border-[#ff7010] pb-3 mb-4.5"
                        >
                          <img
                            src={content.imageUrl}
                            alt="image"
                            className="w-full object-cover h-38 rounded-md mb-2"
                          />
                          <p
                            className="font-aptos-regular line-clamp-4"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeDescription(content?.description),
                            }}
                          ></p>
                        </Link>
                      )
                    })}
                </div>
              </>
            )}
          </div>

          {/* growth-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              Growth
            </h1>
            {growths && growths.length > 0 && (
              <>
                <Link to={`growth/${growths[0].id}`} className="relative mb-5">
                  <img
                    src={growths[0].imageUrl}
                    alt="image"
                    className="rounded-md w-full h-58 md:h-68 xl:h-78 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-34 bg-gradient-to-t from-black/100 to-transparent rounded-b-md"></div>
                  <p
                    className="absolute bottom-1 text-white font-aptos-regular line-clamp-2 px-2 z-10"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeDescription(growths[0]?.description),
                    }}
                  ></p>
                </Link>
                <hr className="text-[#ff7010] mb-7 " />
                <div className="">
                  {growths &&
                    growths.length > 0 &&
                    growths.slice(1).map((content, index) => {
                      return (
                        <Link
                          to={`growth/${content.id}`}
                          key={content.id}
                          className={`flex flex-col sm:flex-row sm:gap-4 border-b border-[#ff7010] pb-2.5 mb-7 md:pb-3 md:mb-6 lg:pb-3.5 lg:mb-6.5 ${
                            index >= 3 ? 'md:hidden' : ''
                          }`}
                        >
                          <img
                            src={content.imageUrl}
                            alt="image"
                            className="w-full sm:w-[230px] object-cover h-38 rounded-md mb-2"
                          />
                          <div className="flex-1">
                            <p
                              className="font-aptos-regular line-clamp-4 sm:line-clamp-6"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeDescription(
                                  content?.description
                                ),
                              }}
                            ></p>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeSeedAndGrowthSection
