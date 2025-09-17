import React from 'react'
import { Link } from 'react-router-dom'

const ConsentBanner = ({ onAccept }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-50 shadow-lg">
      <p className="text-sm sm:text-base">
        This website uses cookies to enhance site navigation, analyze site usage
        and assist in our marketing efforts.{' '}
        <Link to="/privacy-policy" className="text-[#ff7010] underline">
          Privacy Policy
        </Link>
      </p>
      <button
        onClick={onAccept}
        className="bg-[#ff7010] cursor-pointer px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
      >
        ACCEPT & CONTINUE →
      </button>
    </div>
  )
}

export default ConsentBanner
