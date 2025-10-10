import { useEffect, useState } from 'react'
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai'
// import { useQuery } from '@tanstack/react-query'
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

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <div className="w-full py-5 flex flex-col items-center justify-end bg-gray-100">
      <div
        className="max-w-6xl w-[90%] md:w-[90%] mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides && slides.length > 0 && (
          <>
            {/* Slides Container */}
            <div className="flex overflow-hidden shadow-lg rounded-lg">
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
                  <div className="sm:w-1/2 sm:h-[250px] lg:h-[300px] w-full h-[200px]">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="aspect-[3/2] object-center lazyload"
                    />
                  </div>

                  {/* Right - Content */}
                  <div className="sm:w-1/2 sm:h-[250px] lg:h-[300px] w-full h-[200px] pt-5 px-3 md:px-5 flex flex-col justify-start items-start bg-slate-200">
                    <h2 className="text-xl md:text-2xl font-aptos-bold text-gray-800 mb-1 pb-1 md:mb-3 sm:line-clamp-2 line-clamp-1">
                      {slide.title}
                    </h2>
                    <p className="text-gray-800 font-aptos-regular text-base md:text-lg mb-5 sm:line-clamp-6 line-clamp-4">
                      {slide.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-center absolute left-[50%] right-[50%] bottom-10">
              <button
                onClick={prevSlide}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded transition-colors cursor-pointer"
              >
                <AiOutlineLeft />
              </button>
              <button
                onClick={nextSlide}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded transition-colors cursor-pointer"
              >
                <AiOutlineRight />
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
