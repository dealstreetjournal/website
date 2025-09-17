import React from 'react'
import { Link } from 'react-router-dom'

const HomeDsjSlider = ({ data }) => {
  return (
    <>
      <div className="w-full py-5">
        <div className="max-w-6xl w-[98%] md:w-[95%] mx-auto bg-slate-200 rounded-md relative">
          {/* NEW Tag with shake animation */}

          <div className="absolute -top-4 left-0 z-10">
            <span className="bg-[#ff7010] font-aptos-bold text-white px-2 py-1 text-xs rounded-md ">
              {data.heading}
            </span>
          </div>

          <div className="absolute -top-4 right-0 z-10 animate-[shake_01s_ease-in-out_infinite]">
            <span className="bg-[#ff7010] font-aptos-bold text-white px-2 py-1 text-xs rounded-xl shadow-lg ">
              NEW
            </span>
          </div>

          {/* Marquee container */}
          <div className="flex justify-center items-center p-2 overflow-hidden">
            <Link
              to={
                data.heading === 'Latest Deal' ? 'latest' : `funding/${data.id}`
              }
              state={{ query: data.title, time: 500 }}
              className="whitespace-nowrap flex items-center animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]"
            >
              <h3 className="font-aptos-bold text-orange-500 inline">
                {data.title}
              </h3>
              <span className="mx-2">:-</span>
              <p className="font-aptos-regular inline">{data.desc}</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeDsjSlider
