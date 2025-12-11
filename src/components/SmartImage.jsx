import React, { useRef, useState, useEffect } from 'react'

const SmartImage = ({ src, alt, className }) => {
  const [isSmall, setIsSmall] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      const container = containerRef.current
      // console.log('ref:', container)
      if (container) {
        const containerWidth = container.offsetWidth
        const containerHeight = container.offsetHeight

        // If image is smaller than container, don't stretch it
        if (
          img.naturalWidth < containerWidth ||
          img.naturalHeight < containerHeight
        ) {
          setIsSmall(true)
        } else {
          setIsSmall(false)
        }
      }
    }
  }, [src])

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center mt-2 w-full 
        h-[250px] sm:h-[350px] md:h-[450px] bg-[#F1F1F1]
         overflow-hidden 
        ${className}`}
    >
      <img
        src={src}
        alt={alt || 'Image'}
        loading="lazy"
        className={`transition-all duration-300 
          ${
            isSmall
              ? 'object-contain max-w-full max-h-full'
              : 'w-full h-full object-cover'
          }`}
      />
    </div>
  )
}

export default SmartImage
