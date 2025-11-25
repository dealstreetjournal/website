import React from 'react'
import { Link } from 'react-router-dom'
import deal from '../assets/deal.svg'
import funding from '../assets/funding.svg'
import financial from '../assets/financial.svg'

const DsjInsight = () => {
  document.title = 'DSJ Insight | DealStreetJournal'

  return (
    <>
      <div className="bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto min-h-[100vh] flex flex-col md:flex-row justify-center items-center gap-5 px-4 py-8 md:py-0">
          {/* latest */}
          <Link
            to="/latest"
            className="flex flex-col justify-center items-center text-center w-full max-w-[350px] md:w-[350px] h-[300px] p-2 border-l-2 border-l-[#ff7010] bg-white shadow-sm rounded-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={deal}
              alt="image"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />

            <h5 className="font-aptos-bold text-2xl text-[#ff7010] text-center">
              Latest Deal
            </h5>

            <h2 className="font-aptos-regular text-sm text-gray-600 mt-2">
              Stay updated with the latest fund raising
            </h2>
            <div className="bg-[#ff7010] px-4 mt-5 py-2 font-aptos-regular text-white w-fit rounded">
              View
            </div>
          </Link>

          {/* funding */}
          <Link
            to="/funding"
            className="flex flex-col justify-center items-center text-center w-full max-w-[350px] md:w-[350px] h-[300px] p-2 border-l-2 border-l-[#ff7010] bg-white shadow-sm rounded-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={funding}
              alt="image"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />

            <h5 className="font-aptos-bold text-2xl text-[#ff7010] text-center">
              Funding365
            </h5>

            <h2 className="font-aptos-regular text-sm text-gray-600 mt-2">
              Explore detailed reports on funding activities
            </h2>
            <div className="bg-[#ff7010] px-4 mt-5 py-2 font-aptos-regular text-white w-fit rounded">
              View
            </div>
          </Link>

          {/* financial */}
          <Link
            to="/financial"
            className="flex flex-col justify-center items-center text-center w-full max-w-[350px] md:w-[350px] h-[300px] p-2 border-l-2 border-l-[#ff7010] bg-white shadow-sm rounded-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={financial}
              alt="image"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />

            <h5 className="font-aptos-bold text-2xl text-[#ff7010] text-center">
              Financial Insight
            </h5>

            <h2 className="font-aptos-regular text-sm text-gray-600 mt-2">
              Access in-depth financial reports and analysis
            </h2>
            <div className="bg-[#ff7010] px-4 mt-5 py-2 font-aptos-regular text-white w-fit rounded">
              View
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

export default DsjInsight
