// import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CompanyCard from '../components/CompanyCard'
import { fetchFundingCompany } from '../api/dsjApi'
import spinner from '../assets/spinner.png'
import { useQuery } from '@tanstack/react-query'

const Funding365 = () => {
  document.title = 'Funding 365 | DealStreetJournal'

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['funding'],
    queryFn: fetchFundingCompany,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const contents = data?.fundingCompanies || []

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
      <div className="w-full bg-[#F8F9FA] py-5">
        <div className="max-w-6xl mx-auto w-[90%]">
          {/* breadcrumb */}
          <div className="font-aptos-semibold flex justify-start">
            <Link
              to="/dsj-insight"
              className="text-black hover:text-slate-700 transition-all duration-300"
            >
              DSJ
            </Link>

            <Link
              to="/funding"
              className="text-[#ff7010] hover:text-[#cc5200] transition-all duration-300"
            >
              /Funding 365
            </Link>
          </div>

          {/* heading */}
          <div className="mt-8 border-2 border-slate-300 bg-slate-200 p-5 rounded-xl shadow-md text-center">
            <h2 className="font-aptos-bold text-2xl xl:text-3xl text-[#ff7010]">
              DSJ Funding 365
            </h2>
            <div className="mx-auto h-[2px] bg-[#ff7010] mt-2 rounded-full animate-[growShrink_2s_ease-in-out_infinite]"></div>
            <p className="font-aptos-semibold text-base xl:text-xl text-gray-800 text-start mt-4">
              Access in-depth annual fundraising reports on startups, featuring
              key valuation metrics like EV/EBITDA and EV/Gross Revenue,
              detailed cap tables with exact shareholding, and insights into new
              lead investors across funding rounds. Each report covers all
              fundraising activity during the financial year — round by round,
              investor&nbsp;by&nbsp;investor.
            </p>
          </div>

          {/* company card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 justify-items-center">
            {contents.map((content) => (
              <CompanyCard
                key={content.id}
                content={content}
                url={'funding'}
                title={'Funding 365'}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Funding365
