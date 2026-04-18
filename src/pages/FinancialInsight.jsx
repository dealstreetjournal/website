import React from 'react'
import { Link } from 'react-router-dom'
import CompanyCard from '../components/CompanyCard'
import { useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { fetchFinancialCompany } from '../api/dsjApi'
import ErrorPage from './ErrorPages'

const FinancialInsight = () => {
  document.title = 'Financial Insight | DealStreetJournal'

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['financialCompany'],
    queryFn: fetchFinancialCompany,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const contents =
    data?.companies.sort((a, b) =>
      a.companyName.localeCompare(b.companyName, undefined, {
        sensitivity: 'base',
      })
    ) || []

  // if (isPending) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[80vh]">
  //       <img
  //         src={spinner}
  //         alt="Loading"
  //         loading="lazy"
  //         className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
  //       />
  //     </div>
  //   )
  // }

  if (isError) {
    return <ErrorPage data={error.message} />
  }

  return (
    <>
      <div className="w-full bg-[#F8F9FA] py-5">
        <div className="max-w-6xl mx-auto w-[90%]">
          {/* breadcrumb */}
          <div className="font-semibold flex justify-start space-x-1">
            <Link
              to="/dsj-insight"
              className="text-black hover:text-slate-700 transition-all duration-300"
            >
              DSJ
            </Link>
            <span className="text-gray-500">/</span>
            <Link
              to="/financial"
              className="text-[#ff7010] hover:text-[#cc5200] whitespace-nowrap transition-all duration-300"
            >
              Financial Insights
            </Link>
          </div>

          {/* heading */}
          <div className="mt-8 border-2 border-slate-300 bg-[#E6E9EF] p-5 rounded-xl shadow-md text-center">
            <h2 className="font-aptos-bold text-2xl xl:text-3xl text-[#ff7010]">
              DSJ Financial Insights
            </h2>
            <div className="mx-auto h-[2px] bg-[#ff7010] mt-2 rounded-full animate-[growShrink_2s_ease-in-out_infinite]"></div>
            <p className="font-aptos-semibold text-base xl:text-xl text-gray-800 mt-4 text-center">
              Access financial statements, financial performance and margin
              analysis, ratio analysis and expenses analysis reports.
            </p>
          </div>

          {isPending && (
            <div className="flex items-center justify-center min-h-[80vh]">
              <img
                src={spinner}
                alt="Loading"
                loading="lazy"
                className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
              />
            </div>
          )}

          {/* company cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 justify-items-center">
            {contents.map((content) => (
              <CompanyCard
                key={content.id}
                content={content}
                url={'financial'}
                title={'Financial Insight'}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default FinancialInsight
