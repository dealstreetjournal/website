import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const DealsSubCard = ({ deal, url, image, heading, date }) => {
  return (
    <>
      <Link to={url} className="lg:grid lg:grid-cols-[30%_70%] lg:gap-5 mb-5">
        <div className="flex justify-center lg:w-24 lg:h-22 xl:w-28 xl:h-24 bg-slate-100 border-2 border-slate-300 rounded-sm">
          <img
            src={image}
            alt={heading}
            loading="lazy"
            className="w-20 h-20 object-contain my-auto rounded mix-blend-multiply"
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
      </Link>
      <hr className="mb-4 text-[#ff7010]" />
    </>
  )
}

export default DealsSubCard
