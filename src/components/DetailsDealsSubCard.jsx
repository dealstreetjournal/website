import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const DetailsDealsSubCard = ({ deal, url, image, heading, date }) => {
  return (
    <Link
      to={url}
      className="group bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      <div className="w-full h-40 bg-slate-200 flex items-center justify-center">
        <img
          src={image}
          alt={heading}
          loading="lazy"
          className="w-32 h-24 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] lg:text-[12px]  tracking-wide whitespace-nowrap text-white bg-gray-500 px-2 py-1 rounded-md font-aptos-semibold">
            {deal}
          </span>
          <span className="text-[9px] lg:text-[12px] font-aptos-semibold whitespace-nowrap text-gray-800">
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
