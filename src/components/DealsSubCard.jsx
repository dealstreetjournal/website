import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const DealsSubCard = ({ deal, url, image, heading, date }) => {
  return (
    <>
      <Link
        to={url}
        className={`grid grid-cols-1 md:hidden ${
          !deal?.grossGraphBox &&
          !deal?.fundRaiseBox &&
          ' lg:grid-cols-[35%_65%] lg:gap-5 mb-5'
        }`}
      >
        {/* <div className="lg:grid lg:grid-cols-[35%_65%] lg:gap-5 mb-5"> */}
        <div className="flex justify-center items-center my-auto lg:w-24 lg:h-22 xl:w-34 xl:h-23 bg-slate-100 rounded-sm overflow-hidden">
          <img
            src={image}
            alt={heading}
            loading="lazy"
            className="w-full h-full object-cover object-center my-auto rounded"
          />
        </div>
        <div className="lg:mr-5 xl:mr-6">
          <div className="flex justify-between items-center mt-2">
            <p className="font-aptos-regular text-[10px] text-white bg-gray-500 w-fit rounded px-2 py-1">
              {deal}
            </p>
            <p className="font-aptos-regular text-[12px] text-gray-700">
              {handleDate(date)}
            </p>
          </div>

          <h1 className="font-aptos-semibold line-clamp-3 lg:text-sm xl:text-base mt-2 leading-snug">
            {heading}
          </h1>
        </div>
        {/* </div> */}
        <hr className="mb-4 text-[#ff7010]" />
      </Link>
    </>
  )
}

export default DealsSubCard
