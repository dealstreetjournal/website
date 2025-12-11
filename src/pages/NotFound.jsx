import React from 'react'
import { Link } from 'react-router-dom'
import nodata from '../assets/nodata.svg'

const NotFound = () => {
  return (
    <>
      <div className="w-full min-h-[80vh] flex flex-col justify-center items-center">
        <img
          src={nodata}
          alt="404 not found"
          loading="lazy"
          className="w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72"
        />
        <h1 className="text-3xl font-aptos-bold text-center mt-20">
          404 - Page Not Found
        </h1>
        <p className="text-center mt-4">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="text-xl mt-2 font-aptos-semibold hover:text-[#ff7010] transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </>
  )
}

export default NotFound
