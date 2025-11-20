import { useEffect, useState } from 'react'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'

import { Link } from 'react-router-dom'

export default function HomeSlider({ data }) {
  const slides = data || []

  // State to manage the slider's pause state and current slide index
  const [isPaused, setIsPaused] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(nextSlide, 8000)
    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <div className="w-full pt-15 flex flex-col items-center justify-end bg-[#F8F9FA]">
      <div
        className="max-w-6xl w-[90%] md:w-[90%] lg:w-[80%] xl:w-[60%] mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides && slides.length > 0 && (
          <>
            {/* Slides Container */}
            <div className="flex overflow-hidden shadow rounded-lg">
              {slides.map((slide) => (
                <Link
                  to={slide.pageUrl}
                  key={slide.id}
                  className={`min-w-full flex flex-col sm:flex-row transition-transform duration-1000 ease-in-out`}
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {/* Left - Image */}
                  <div className="sm:w-1/2 sm:h-[240px] lg:h-[280px] w-full h-[200px]">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center lazyload bg-amber-800"
                    />
                  </div>

                  {/* Right - Content */}
                  <div className="sm:w-1/2 sm:h-[240px] lg:h-[280px] w-full h-[200px] pt-5 px-3 md:px-5 flex flex-col justify-start items-start bg-white">
                    <h2
                      title={slide.title}
                      className="text-xl md:text-[22px] font-aptos-semibold text-gray-900 mb-1 pb-1 md:mb-3 line-clamp-3"
                    >
                      {slide.title}
                    </h2>
                    <p className="text-gray-800 font-aptos-regular text-base md:text-lg lg:line-clamp-3 line-clamp-2">
                      {slide.description}
                    </p>
                    <span className="text-[#ff7010] font-aptos-semibold">
                      Read More...
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-center absolute left-[50%] right-[50%] bottom-9 sm:bottom-7">
              <button
                onClick={prevSlide}
                className="p-1 bg-[#ff7010]/90 hover:bg-orange-700 text-white rounded-full transition-colors cursor-pointer"
              >
                <MdOutlineKeyboardArrowLeft size={25} />
              </button>
              <button
                onClick={nextSlide}
                className="p-1 bg-[#ff7010]/90 hover:bg-orange-700 text-white rounded-full transition-colors cursor-pointer"
              >
                <MdOutlineKeyboardArrowRight size={25} />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-orange-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
