import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'
import DOMPurify from 'dompurify'
import { FaUserCircle } from 'react-icons/fa'

const DealsRightCard = ({
  deal,
  url,
  company,
  image,
  heading,
  date,
  desc,
  writtenBy,
}) => {
  const cleanHTML = DOMPurify.sanitize(desc)

  return (
    <>
      <Link to={url}>
        <div className="lg:grid lg:grid-cols-[35%_65%] lg:gap-5 mb-5">
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

            <h3 className="md:hidden font-aptos-semibold text-[#ff7010] text-md mt-2">
              {company}
            </h3>

            <h1 className="font-aptos-semibold line-clamp-1 text-xl mb-1 md:line-clamp-3 md:text-sm xl:text-base md:mt-2 md:leading-snug">
              {heading}
            </h1>

            <p
              className="md:hidden font-aptos-regular line-clamp-3 text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            ></p>
            <span className="md:hidden flex justify-start items-center gap-1 font-aptos-semibold text-sm text-gray-500">
              <FaUserCircle /> {writtenBy}
            </span>
          </div>
        </div>
        <hr className="mb-4 text-[#ff7010]" />
      </Link>
    </>
  )
}

export default DealsRightCard
