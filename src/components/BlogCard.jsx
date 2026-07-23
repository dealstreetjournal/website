import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'
import { handleDesc } from './handleDesc'

const BlogCard = ({ url, index, array, image, heading, desc, date }) => {
  return (
    <>
      <Link to={url} className="lg:grid lg:grid-cols-[30%_70%] lg:gap-4">
        <div className="flex justify-center items-center w-full max-w-[258px] mx-auto aspect-[4/2.4] bg-gray-300 rounded-lg overflow-clip">
          <img
            src={image}
            alt={heading}
            loading="lazy"
            className="w-full h-full object-cover object-center my-auto"
          />
        </div>
        <div className="md:mr-6">
          <div className="flex justify-between items-center mt-2">
            <p className="font-aptos-semibold text-[12px] text-white bg-[#ff7010] w-fit rounded-full px-2 py-1">
              Opinion
            </p>
            <p className="font-aptos-regular text-sm text-gray-500">
              {handleDate(date)}
            </p>
          </div>

          <h1 className="font-aptos-bold line-clamp-2 text-xl my-2">
            {heading}
          </h1>
          <p className="font-aptos-regular line-clamp-3 text-sm text-gray-700">
            {handleDesc(desc)}
          </p>
        </div>
      </Link>
      {index !== array.length - 1 && <hr className="my-8 text-gray-300" />}
    </>
  )
}

export default BlogCard
