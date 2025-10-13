import React from 'react'
import { Link } from 'react-router-dom'

const HomeDsjSlider = ({ data = [], heading }) => {
  // Ensure data is always an array
  const validData = Array.isArray(data) ? data : []
  // Duplicate data multiple times for seamless infinite scroll
  const duplicatedData = [...validData, ...validData, ...validData]

  return (
    <>
      {validData.length > 0 && (
        <div className="w-full py-5">
          <div className="relative max-w-6xl w-[98%] md:w-[95%] mx-auto rounded-md">
            {/* Heading and NEW tag */}
            <span className="bg-[#ff7010] absolute -top-3 left-0 font-aptos-bold text-white px-2 py-1 text-xs rounded-md z-10">
              {heading}
            </span>
            <span className="bg-[#ff7010] absolute -top-3 right-0 font-aptos-bold text-white px-2 py-1 text-xs rounded-xl shadow-lg z-10 animate-[shake_1s_ease-in-out_infinite]">
              NEW
            </span>

            {/* Marquee Container */}
            <div className="bg-slate-200 rounded-md overflow-hidden p-2">
              <div className="flex items-center marquee-container">
                <div
                  className={`flex items-center ${
                    heading === 'Latest Deal'
                      ? 'marquee-content'
                      : 'marquee-content-fast'
                  }`}
                >
                  {duplicatedData.map((d, index) => (
                    <Link
                      key={`${d.id || d.title}-${index}`}
                      to={
                        d.heading === 'Latest Deal'
                          ? 'latest'
                          : `funding/${d.id}`
                      }
                      state={{ query: d.title, time: 500 }}
                      className="flex items-center mr-10 whitespace-nowrap"
                    >
                      <h3 className="font-aptos-bold text-[#ff7010] inline">
                        {d.title}
                      </h3>
                      <span className="mx-2 mt-[-5px]">:</span>
                      <p className="inline font-aptos-regular">{d.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HomeDsjSlider
