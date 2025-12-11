import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'

const HomeSeedAndGrowthSection = ({ seedData, growthData }) => {
  const Seeds = seedData || []
  const growths = useMemo(() => growthData || [], [growthData])

  const [visibleItems, setVisibleItems] = useState(growths.slice(1))

  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth
      if (width >= 768 && width < 1024) {
        // tablet (md to lg)
        setVisibleItems(growths.slice(1, 6)) // show 5 items
      } else {
        // mobile or desktop
        setVisibleItems(growths.slice(1, 7))
      }
    }

    updateVisibleItems() // run once
    window.addEventListener('resize', updateVisibleItems)
    return () => window.removeEventListener('resize', updateVisibleItems)
  }, [growths])

  return (
    <>
      <div className="w-full bg-[#F8F9FA] py-10">
        <div className="max-w-6xl mx-auto w-[90%] grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-4 lg:gap-8">
          {/* seed-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              Seed
            </h1>
            {Seeds && Seeds.length > 0 && (
              <>
                <Link to={`seed/${Seeds[0].id}`}>
                  <div
                    key={Seeds[0].id}
                    className="bg-white rounded-md p-4 mb-5 shadow overflow-hidden"
                  >
                    <img
                      src={Seeds[0].imageUrl}
                      alt={Seeds[0].title}
                      loading="lazy"
                      className="rounded-md w-full h-65 md:h-68 xl:h-78 object-cover object-center"
                    />

                    <p
                      title={Seeds[0]?.title}
                      className="font-aptos-regular text-gray-800 text-lg mt-4 line-clamp-2"
                    >
                      {Seeds[0]?.title}
                    </p>
                  </div>
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-3 lg:gap-5">
                  {Seeds &&
                    Seeds.length > 0 &&
                    Seeds.slice(1).map((content) => {
                      return (
                        <Link
                          to={`seed/${content.id}`}
                          key={content.id}
                          className=" bg-white rounded-lg shadow overflow-clip"
                        >
                          <img
                            src={content.imageUrl}
                            alt={content.title}
                            loading="lazy"
                            className=" object-cover object-center w-full h-[180px] md:h-[130px] lg:h-[150px] xl:h-[170px]"
                          />
                          <div className="flex md:flex-col lg:flex-row justify-between items-top px-3 mt-3 font-aptos-regular text-sm">
                            <p className="text-[#ff7010] font-aptos-semibold">
                              {content.brandName}
                            </p>
                            <p className="whitespace-nowrap text-gray-500">
                              {handleDate(content.articleDate)}
                            </p>
                          </div>
                          <p
                            className="font-aptos-regular px-3 my-3 line-clamp-3"
                            title={content.title}
                          >
                            {content.title}
                          </p>
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
                <Link to={`growth/${growths[0].id}`}>
                  <div
                    key={growths[0].id}
                    className="bg-white rounded-md p-4 mb-5 shadow overflow-hidden"
                  >
                    <img
                      src={growths[0].imageUrl}
                      alt={growths[0].title}
                      loading="lazy"
                      className="rounded-md w-full h-60 md:h-68 xl:h-78 object-cover object-center"
                    />

                    <p
                      title={growths[0]?.title}
                      className="font-aptos-regular text-gray-800 text-lg mt-4 line-clamp-2"
                    >
                      {growths[0]?.title}
                    </p>
                  </div>
                </Link>

                <div>
                  {visibleItems && visibleItems.length > 0 && (
                    <div className="grid grid-cols-1">
                      {visibleItems.map((content, index, arr) => (
                        <React.Fragment key={content.id}>
                          <Link
                            to={`growth/${content.id}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <img
                              src={content.imageUrl}
                              alt={content.title}
                              loading="lazy"
                              className="object-cover object-center w-[100px] h-[80px] rounded-md flex-shrink-0"
                            />

                            <div className="">
                              <div className="flex flex-wrap md:flex-col lg:flex-row justify-between sm:justify-start md:items-start lg:items-center gap-5 md:gap-0 lg:gap-5 font-aptos-regular text-sm ">
                                <p className="text-[#ff7010] font-aptos-semibold whitespace-nowrap">
                                  {content.brandName}
                                </p>
                                <p className="whitespace-nowrap text-gray-500">
                                  {handleDate(content.articleDate)}
                                </p>
                              </div>
                              <p
                                title={content.title}
                                className="font-aptos-regular line-clamp-2 w-full"
                              >
                                {content.title}
                              </p>
                            </div>
                          </Link>
                          {index !== arr.length - 1 && (
                            <hr className="text-gray-200 my-3.5" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
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
