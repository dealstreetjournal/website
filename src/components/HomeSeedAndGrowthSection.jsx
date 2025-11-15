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
        setVisibleItems(growths.slice(1))
      }
    }

    updateVisibleItems() // run once
    window.addEventListener('resize', updateVisibleItems)
    return () => window.removeEventListener('resize', updateVisibleItems)
  }, [growths])

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
                <Link
                  to={`seed/${Seeds[0].id}`}
                  className="relative block mb-5"
                >
                  <div className="w-full rounded-md bg-white overflow-hidden">
                    <img
                      src={Seeds[0].imageUrl}
                      alt={Seeds[0].title}
                      loading="lazy"
                      className="rounded-md w-full h-65 md:h-68 xl:h-78 object-cover object-center"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent rounded-b-md"></div>
                  <p
                    title={Seeds[0]?.title}
                    className="absolute bottom-1 left-0 right-0 text-white font-aptos-regular text-xl line-clamp-1 px-2 z-10"
                  >
                    {Seeds[0]?.title}
                  </p>
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
                          className="border-b border-[#ff7010] pb-2 mb-1 sm:pb-6 sm:mb-6 lg:pb-3.5 lg:mb-4 xl:pb-2 xl:mb-1"
                        >
                          {/* <div className="flex justify-center items-center bg-gray-300 rounded overflow-hidden"> */}
                          <img
                            src={content.imageUrl}
                            alt={content.title}
                            loading="lazy"
                            className=" object-cover object-center w-full h-[180px] md:h-[130px] lg:h-[150px] xl:h-[170px] rounded-md shadow-md"
                          />
                          {/* </div> */}
                          <div className="flex justify-between items-top mt-3 font-aptos-regular text-sm text-gray-700">
                            <p className="text-orange-700 font-aptos-semibold">
                              {content.brandName}
                            </p>
                            <p className="whitespace-nowrap">
                              {handleDate(content.articleDate)}
                            </p>
                          </div>
                          <p
                            className="font-aptos-regular line-clamp-3 mt-1.5 w-full"
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
                <Link
                  to={`growth/${growths[0].id}`}
                  className="relative block mb-5"
                >
                  <div className="w-full rounded-md bg-white">
                    <img
                      src={growths[0].imageUrl}
                      alt={growths[0].title}
                      loading="lazy"
                      className="rounded-md w-full h-60 md:h-68 xl:h-78 object-cover object-center"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent rounded-b-md"></div>
                  <p
                    title={growths[0]?.title}
                    className="absolute bottom-1 left-0 right-0 text-white font-aptos-regular text-xl line-clamp-1 px-2 z-10"
                  >
                    {growths[0]?.title}
                  </p>
                </Link>
                <hr className="text-[#ff7010] mb-7 " />
                <div>
                  {visibleItems && visibleItems.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-2">
                      {visibleItems.map((content) => (
                        <div
                          key={content.id}
                          className="flex justify-left items-start gap-2 pb-2 mb-3"
                        >
                          <Link
                            to={`growth/${content.id}`}
                            className="flex gap-2 w-full"
                          >
                            {/* <div> */}
                            <div className="flex justify-center items-center w-[100px] h-[80px] bg-slate-300 rounded overflow-hidden">
                              <img
                                src={content.imageUrl}
                                alt={content.title}
                                loading="lazy"
                                // className="w-full h-full object-cover object-center rounded-t-md"
                                className="w-full h-full object-cover object-center rounded-t-md "
                              />
                            </div>
                            {/* </div> */}

                            <div className="flex-1">
                              <div className="flex justify-between items-start font-aptos-regular text-sm text-gray-700">
                                <p className="text-orange-700 font-aptos-semibold whitespace-nowrap">
                                  {content.brandName}
                                </p>
                                <p className=" md:hidden whitespace-nowrap text-[12px] font-aptos text-gray-700">
                                  {handleDate(content.articleDate)}
                                </p>
                              </div>
                              <p
                                title={content.title}
                                className="font-aptos-regular line-clamp-3 w-full"
                              >
                                {content.title}
                              </p>
                              <p className="hidden md:flex whitespace-nowrap justify-end items-center text-[12px] font-aptos text-gray-700">
                                {handleDate(content.articleDate)}
                              </p>
                            </div>
                          </Link>
                        </div>
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
