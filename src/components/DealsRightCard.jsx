import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'
import DOMPurify from 'dompurify'
import { FaUserCircle } from 'react-icons/fa'

const DealsRightCard = ({
  index,
  array,
  url,
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
        <div className="lg:grid lg:grid-cols-[25%_75%]">
          <div className="flex justify-center items-center my-auto w-22 h-22 bg-gray-300 rounded-lg overflow-clip">
            <img
              src={image}
              alt={heading}
              loading="lazy"
              className="w-full h-full object-cover object-center my-auto rounded-lg"
            />
          </div>
          <div className="ml-4 md:ml-8">
            <p className="font-aptos-regular text-sm text-gray-500">
              {handleDate(date)}
            </p>

            <h1 className="font-aptos-semibold line-clamp-1 text-xl mb-1 md:line-clamp-2 md:text-sm xl:text-base md:mt-2 md:leading-snug">
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
        {index !== array.length - 1 && <hr className="my-6 text-gray-300" />}
      </Link>
    </>
  )
}

export default DealsRightCard
