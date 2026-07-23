import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'
import DOMPurify from 'dompurify'
import { FaUserCircle } from 'react-icons/fa'

const DealsRightCard = ({
  index,
  array,
  deal,
  url,
  image,
  heading,
  date,
  desc,
}) => {
  const cleanHTML = DOMPurify.sanitize(desc)

  return (
    <>
      <Link to={url}>
        <div className="lg:grid lg:grid-cols-[25%_75%] mt-10 sm:mt-0">
          <div className="flex justify-center items-center w-full aspect-[4.2/2.4] lg:w-22 bg-gray-300 rounded-lg overflow-clip">
            <img
              src={image}
              alt={heading}
              loading="lazy"
              className="w-full h-full object-cover object-center my-auto"
            />
          </div>
          <div className="lg:ml-9">
            <div className="flex justify-between items-center mt-2">
              <p className="lg:hidden font-aptos-semibold text-[12px] text-white bg-[#ff7010] w-fit rounded-full px-2 py-1">
                {deal}
              </p>
              <p className="font-aptos-regular text-sm text-gray-500">
                {handleDate(date)}
              </p>
            </div>

            <h1 className="font-aptos-bold lg:font-aptos-semibold text-xl my-2 sm:mb-1 line-clamp-2 md:text-sm xl:text-base md:mt-2 md:leading-snug">
              {heading}
            </h1>

            <p
              className="md:hidden font-aptos-regular line-clamp-3 text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            ></p>
          </div>
        </div>
      </Link>
      {index !== array.length - 1 && (
        <hr className="my-8 sm:my-6 text-gray-300" />
      )}
    </>
  )
}

export default DealsRightCard
