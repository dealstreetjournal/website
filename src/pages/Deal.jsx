import React, { useEffect, useState } from 'react'
import DealsCard from '../components/DealsCard'
import DealsSubCard from '../components/DealsSubCard'
import Pagination from '../components/Pagination'
import { useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { fetchDeal } from '../api/dealApi'
import { useLocation } from 'react-router-dom'

const Deal = () => {
  const location = useLocation()

  const path = location.pathname.split('/')[1]?.toLowerCase()

  useEffect(() => {
    setPage(1) // reset to first page whenever path changes
  }, [path])

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

  const [page, setPage] = useState(1)

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['deal', path, page],
    queryFn: () => fetchDeal(path, page),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const rightContents = data?.deals.slice(0, 10) || []
  const leftContents = data?.deals.slice(10) || []
  const totalPages = Math.ceil((data?.totalCount || 0) / 20)

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
      <div className=" bg-slate-50 pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <h1 className="font-aptos-bold text-3xl text-[#ff7010] my-5">
            {dealTitle}
          </h1>
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
            <div className="">
              {rightContents.map((content) => (
                <DealsCard
                  key={content.id}
                  url={`/${path}/${content.id}`}
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

            <div className="hidden md:block">
              {/* <div className="sticky top-1"> */}
              <div className="flex justify-between items-center mr-2 mb-5">
                <h5 className="font-aptos-bold text-[#e66000] md:text-md lg:text-xl">
                  Latest Stories
                </h5>
                <hr className="md:w-20 lg:w-30 border-t-2 border-[#e66000]" />
              </div>

              {leftContents.map((content) => (
                <DealsSubCard
                  key={content.id}
                  url={`/${path}/${content.id}`}
                  deal={dealTitle}
                  image={content.imageUrl}
                  heading={content.title}
                  date={content.articleDate}
                />
              ))}
            </div>
            {/* </div> */}
          </div>
          <div className="flex justify-center items-center">
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Deal

// import React, { useEffect, useState } from 'react'
// import DealsCard from '../components/DealsCard'
// import DealsSubCard from '../components/DealsSubCard'
// import Pagination from '../components/Pagination'
// import { useQuery } from '@tanstack/react-query'
// import spinner from '../assets/spinner.png'
// import { fetchDeal } from '../api/dealApi'
// import { useLocation } from 'react-router-dom'

// const Deal = () => {
//   const location = useLocation()
//   const path = location.pathname.split('/')[1]?.toLowerCase()
//   const [page, setPage] = useState(1)

//   useEffect(() => {
//     setPage(1) // reset to first page whenever path changes
//   }, [path])

//   // Mapping for titles
//   const dealTypeMap = {
//     preseed: 'Pre seed',
//     seed: 'Seed',
//     growth: 'Growth',
//     ma: 'M&A',
//     ipo: 'IPO',
//     world: 'World',
//   }

//   const dealTitle = dealTypeMap[path] || ''
//   document.title = `${dealTitle}`

//   const { isPending, isError, data, error } = useQuery({
//     queryKey: ['deal', path, page],
//     queryFn: () => fetchDeal(path, page),
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   })

//   // Sort articles by date descending
//   const sortedDeals = data?.deals
//     ?.slice()
//     .sort((a, b) => new Date(b.articleDate) - new Date(a.articleDate)) || []

//   const rightContents = sortedDeals.slice(0, 10)
//   const leftContents = sortedDeals.slice(10)
//   const totalPages = Math.ceil((data?.totalCount || 0) / 20)

//   if (isPending) {
//     return (
//       <div className="flex items-center justify-center min-h-[80vh]">
//         <img
//           src={spinner}
//           alt="Loading"
//           className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
//         />
//       </div>
//     )
//   }

//   if (isError) {
//     return <span>Error: {error.message}</span>
//   }

//   return (
//     <div className="bg-slate-50 pb-5 w-full mx-auto">
//       <div className="bg-gray-200 h-48">
//         <div className="max-w-6xl mx-auto h-full"></div>
//       </div>

//       <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
//         <h1 className="font-aptos-bold text-3xl text-[#ff7010] my-5">
//           {dealTitle}
//         </h1>
//         <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
//           <div>
//             {rightContents.map((content) => (
//               <DealsCard
//                 key={content.id}
//                 url={`/${path}/${content.id}`}
//                 deal={dealTitle}
//                 company={content.brandName}
//                 image={content.imageUrl}
//                 heading={content.title}
//                 desc={content.description}
//                 date={content.articleDate}
//                 writtenBy={content?.writtenBy || 'Team DSJ'}
//               />
//             ))}
//           </div>

//           <div className="hidden md:block">
//             <div className="flex justify-between items-center mr-2 mb-5">
//               <h5 className="font-aptos-bold text-[#e66000] md:text-md lg:text-xl">
//                 Latest Stories
//               </h5>
//               <hr className="md:w-20 lg:w-30 border-t-2 border-[#e66000]" />
//             </div>

//             {leftContents.map((content) => (
//               <DealsSubCard
//                 key={content.id}
//                 url={`/${path}/${content.id}`}
//                 deal={dealTitle}
//                 image={content.imageUrl}
//                 heading={content.title}
//                 date={content.articleDate}
//               />
//             ))}
//           </div>
//         </div>
//         <div className="flex justify-center items-center">
//           <Pagination page={page} setPage={setPage} totalPages={totalPages} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Deal
