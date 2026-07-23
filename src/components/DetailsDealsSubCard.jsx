import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const DetailsDealsSubCard = ({ deal, url, image, heading, date }) => {
  return (
    <Link
      to={url}
      className="group bg-white shadow rounded-xl hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      <div className="w-full max-w-[185px] mx-auto aspect-[4.5/2.5] bg-slate-200 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={heading}
          loading="lazy"
          className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="px-2 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] xl:text-[12px] tracking-wide whitespace-nowrap text-white bg-gray-500 px-2 py-1 rounded-md font-aptos-semibold">
            {deal}
          </span>
          <span className="text-[10px] xl:text-[12px] font-aptos-semibold whitespace-nowrap text-gray-500">
            {handleDate(date)}
          </span>
        </div>

        <h2 className="font-aptos-semibold text-gray-900 text-base line-clamp-3 group-hover:text-orange-600 transition-colors duration-300">
          {heading}
        </h2>
      </div>
    </Link>
  )
}

export default DetailsDealsSubCard
