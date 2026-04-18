import React, { useEffect, useMemo, useRef, useState } from 'react'
import DealsCard from '../components/DealsCard'
import { useInfiniteQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { fetchDeal } from '../api/dealApi'
import { useLocation } from 'react-router-dom'
import DealsRightCard from '../components/DealsRightCard'
import { FiCheckCircle } from 'react-icons/fi'
import ErrorPage from './ErrorPages'

const Deal = () => {
  const categories = ['All']
  const [clickedCategory, setClickedCategory] = useState(null)

  const location = useLocation()

  const path = location.pathname.split('/')[1]?.toLowerCase()

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

  document.title = `${dealTitle}`

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['allDeals', path],
    queryFn: ({ pageParam = 1 }) => fetchDeal(path, { pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
  })

  console.log('allDeal', data)

  const loaderRef = useRef(null)

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1 }
    )

    observer.observe(node)

    return () => {
      if (node) observer.unobserve(node)
    }
  }, [fetchNextPage, hasNextPage])

  // ✅ Flatten all pages into a single jobs array
  const allDeals = useMemo(
    () => data?.pages.flatMap((page) => page.deals) ?? [],
    [data]
  )

  // console.log('Fetched deal data:', allDeals)

  allDeals.forEach((deal) => {
    if (deal.category && !categories.includes(deal.category)) {
      categories.push(deal.category)
    }
  })

  // console.log('Unique categories:', categories)

  const filteredDeals =
    clickedCategory === 'All' || clickedCategory === null
      ? allDeals
      : allDeals.filter((deal) => deal.category === clickedCategory)

  let leftContents = []
  let rightContents = []
  if (filteredDeals.length < allDeals.length) {
    leftContents = filteredDeals
  } else {
    const halfCount = Math.ceil(filteredDeals.length / 2)
    leftContents = filteredDeals.filter((_, i) => i < halfCount)
    rightContents = filteredDeals.filter((_, i) => i >= halfCount)
  }

  if (status === 'error') {
    return <ErrorPage data={error.message} />
  }

  return (
    <>
      <div className=" bg-[#F8F9FA] pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <h1 className="font-aptos-bold text-4xl text-gray-800 mt-5">
            {dealTitle}
          </h1>

          {status === 'pending' && (
            <div className="flex items-center justify-center">
              <img
                src={spinner}
                alt="Loading"
                loading="lazy"
                className="w-12 h-12 animate-spin mix-blend-multiply"
              />
            </div>
          )}

          <div
            className="w-full overflow-x-scroll mx-auto whitespace-nowrap smooth-scroll my-3"
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.length > 0 &&
              categories.map((cat, idx) => (
                <span
                  key={idx}
                  onClick={() => setClickedCategory(cat)}
                  className="cursor-pointer inline-block bg-gray-300/50 text-gray-700 px-3 pt-1 pb-1.5 rounded-full mr-2 mb-5 text-base font-aptos-semibold"
                >
                  {cat}
                </span>
              ))}
          </div>
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-5 lg:gap-10">
            <div className="">
              {leftContents.map((content, index, arr) => (
                <DealsCard
                  key={index}
                  index={index}
                  array={arr}
                  url={`/${path}/${content.slug}`}
                  deal={dealTitle}
                  company={content.brandName}
                  image={content.imageUrl}
                  heading={content.title}
                  desc={content.description}
                  date={content.articleDate}
                  writtenBy={content?.writtenBy || 'Team DSJ'}
                />
              ))}
            </div>

            {rightContents.length > 0 && (
              <div className="sm:border sm:border-gray-300 sm:rounded-lg sm:p-6">
                <div className="sticky top-1">
                  <div className="hidden md:flex justify-between items-center mr-2 mb-5">
                    <h5 className="font-aptos-bold text-gray-800 md:text-xl lg:text-2xl">
                      Previous Articles
                    </h5>
                  </div>

                  {rightContents.map((content, index, arr) => (
                    <DealsRightCard
                      key={index}
                      url={`/${path}/${content.slug}`}
                      index={index}
                      array={arr}
                      deal={dealTitle}
                      company={content.brandName}
                      image={content.imageUrl}
                      desc={content.description}
                      heading={content.title}
                      date={content.articleDate}
                      writtenBy={content?.writtenBy || 'Team DSJ'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            ref={loaderRef}
            className="h-20 flex justify-center items-center"
          >
            {isFetchingNextPage && <p>Loading more...</p>}
          </div>

          {!hasNextPage && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-400">
                <FiCheckCircle size={14} className="text-orange-500" />
                You've seen {filteredDeals.length} articles in {dealTitle}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Deal
