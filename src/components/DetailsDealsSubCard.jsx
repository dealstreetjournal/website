import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const DealsSubCard = ({ deal, url, image, heading, date }) => {
  return (
    <>
      <Link to={url}>
        <div className="aspect-square bg-slate-200 p-2 rounded">
        
          <div className="flex justify-center xl:w-[190px] md:w-[150px] md:h-24 lg:h-24 xl:h-28 bg-slate-100 border-2 border-slate-300 rounded-sm shadow-lg">
            <img
              src={image}
              alt={heading}
              loading="lazy"
              className="w-full h-full object-contain my-auto rounded mix-blend-multiply"
            />
          </div>
          <div className="">
            <div className="flex justify-between items-center mt-2">
              <p className="font-aptos-regular text-[10px] text-white bg-gray-500 w-fit rounded px-2 py-1">
                {deal}
              </p>
              <p className="font-aptos-regular text-[13px] text-gray-700">
                {handleDate(date)}
              </p>
            </div>

            <h1 className="font-aptos-semibold line-clamp-3 lg:text-sm xl:text-base mt-2 leading-snug">
              {heading}
            </h1>
          </div>
        </div>
      </Link>
    </>
  )
}

export default DealsSubCard
