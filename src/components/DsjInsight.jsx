import React from 'react'
import deal from '../assets/deal.svg'
import funding from '../assets/funding.svg'
import financial from '../assets/financial.svg'
import { Link } from 'react-router-dom'

const DsjInsight = () => {
  return (
    <>
      <div className="flex flex-row justify-center items-center">
        <div className="w-full">
          {/* latest deal */}
          <Link
            to="/latest"
            className="flex md:flex-col lg:flex-row gap-8 p-2 mb-4 justify-start md:justify-center lg:justify-start items-center shadow rounded-md bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={deal}
              alt="latestdeal"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />
            <div className="md:text-center lg:text-left">
              <h5 className="bg-[#ff7010] w-fit md:mx-auto lg:mx-0 px-2 py-1 text-sm rounded font-aptos-semibold text-white animate-[move_01s_ease-in-out_infinite] hover:[animation-play-state:paused]">
                Latest Deal
              </h5>
              <h2 className="font-aptos-semibold mt-1">
                Stay updated with the latest fund raising
              </h2>
            </div>
          </Link>
          {/* <hr className="text-[#ff7010] mb-4" /> */}

          {/* funding 365 */}
          <Link
            to="/funding"
            className="flex md:flex-col lg:flex-row gap-8 p-2 mb-4 justify-start md:justify-center lg:justify-start items-center shadow rounded-md bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={funding}
              alt="funding365"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />
            <div className="md:text-center lg:text-left">
              <h5 className="bg-[#ff7010] w-fit md:mx-auto lg:mx-0 px-2 py-1 text-sm rounded font-aptos-semibold text-white animate-[demove_01s_ease-in-out_infinite] hover:[animation-play-state:paused]">
                Funding 365
              </h5>
              <h2 className="font-aptos-semibold mt-1">
                Explore detailed reports on funding activities
              </h2>
            </div>
          </Link>
          {/* <hr className="text-[#ff7010] mb-4" /> */}

          {/* financial insight */}
          <Link
            to="/financial"
            className="flex md:flex-col lg:flex-row gap-8 p-2 mb-2 justify-start md:justify-center lg:justify-start items-center shadow rounded-md bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={financial}
              alt="financial"
              loading="lazy"
              className="w-25 h-25 object-contain"
            />
            <div className="md:text-center lg:text-left">
              <h5 className="bg-[#ff7010] w-fit md:mx-auto lg:mx-0 px-2 py-1 text-sm rounded font-aptos-semibold text-white animate-[move_01s_ease-in-out_infinite] hover:[animation-play-state:paused]">
                Financial Insights
              </h5>
              <h2 className="font-aptos-semibold mt-1">
                Access in-depth financial reports and analysis
              </h2>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

export default DsjInsight
