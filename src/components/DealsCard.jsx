import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'
import DOMPurify from 'dompurify'
import { FaUserCircle } from 'react-icons/fa'

const DealsCard = ({
  deal,
  url,
  company,
  image,
  heading,
  desc,
  date,
  writtenBy,
}) => {
  const cleanHTML = DOMPurify.sanitize(desc)
  return (
    <>
      <Link to={url} className="lg:grid lg:grid-cols-[30%_70%] lg:gap-4">
        <div className="w-full h-38">
          <img
            src={image}
            alt="preseed image"
            className="w-full object-cover h-full my-auto rounded"
          />
        </div>
        <div className="md:mr-6">
          <div className="flex justify-between items-center mt-2">
            <p className="font-aptos-regular text-[12px] text-white bg-gray-500 w-fit rounded px-2 py-1">
              {deal}
            </p>
            <p className="font-aptos-regular text-sm text-gray-700">
              {handleDate(date)}
            </p>
          </div>
          <h3 className="font-aptos-semibold text-[#ff7010] text-md mt-2">
            {company}
          </h3>
          <h1 className="font-aptos-bold line-clamp-1 text-xl mb-1">
            {heading}
          </h1>
          <p
            className="font-aptos-regular line-clamp-3 text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
          ></p>
          <span className="flex justify-start items-center gap-1 font-aptos-semibold text-sm text-gray-500">
            <FaUserCircle /> {writtenBy}
          </span>
        </div>
      </Link>
      <hr className="mt-1 mb-8 text-[#ff7010]" />
    </>
  )
}

export default DealsCard
