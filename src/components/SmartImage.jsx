import React from 'react'

const SmartImage = ({ src, alt, className }) => {
  return (
    <div
      className={`flex justify-center items-center mt-2 w-full
        aspect-[4.2/2.4] bg-[#F1F1F1]
         overflow-hidden
        ${className}`}
    >
      <img
        src={src}
        alt={alt || 'Image'}
        loading="lazy"
        className="w-full h-full object-cover object-center"
      />
    </div>
  )
}

export default SmartImage
