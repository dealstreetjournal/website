import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Function to extract dominant color from image
const getDominantColor = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        const colorCount = {}

        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Skip very light or very dark colors
          if (r > 240 && g > 240 && b > 240) continue
          if (r < 15 && g < 15 && b < 15) continue

          // Round to nearest 10 to group similar colors
          const roundedR = Math.round(r / 10) * 10
          const roundedG = Math.round(g / 10) * 10
          const roundedB = Math.round(b / 10) * 10

          const colorKey = `${roundedR},${roundedG},${roundedB}`
          colorCount[colorKey] = (colorCount[colorKey] || 0) + 1
        }

        // Find the most common color
        let dominantColor = '70,112,160' // Default blue
        let maxCount = 0

        for (const [color, count] of Object.entries(colorCount)) {
          if (count > maxCount) {
            maxCount = count
            dominantColor = color
          }
        }

        resolve(dominantColor)
      } catch (error) {
        // Fallback color if CORS issues
        console.log(error)
        resolve('70,112,160')
      }
    }

    img.onerror = () => {
      resolve('70,112,160') // Fallback color
    }

    img.src = imageSrc
  })
}

const CompanyCard = ({ content, url, title }) => {
  const [dominantColor, setDominantColor] = useState('70,112,160')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    getDominantColor(content.companyLogoUrl).then((color) => {
      setDominantColor(color)
      setIsLoaded(true)
    })
  }, [content.companyLogoUrl])

  return (
    <div
      className="w-[250px] h-[200px]"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/${url}/${content.id}`}
        state={{ companyName: content.companyName }}
        className="relative w-full h-full block"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out',
        }}
      >
        {/* Front side */}
        <div
          className="absolute inset-0 rounded-xl shadow-lg flex justify-center items-center p-4"
          style={{
            backgroundColor: isLoaded
              ? `rgba(${dominantColor}, 0.2)`
              : 'rgba(70,112,160,0.2)',
            border: isLoaded
              ? `2px solid rgba(${dominantColor}, 0.4)`
              : '2px solid rgba(70,112,160,0.4)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <img
            src={content.companyLogoUrl}
            alt="company-image"
            className="object-cover w-full h-full rounded-lg shadow-md"
            crossOrigin="anonymous"
            loading="lazy"
          />
        </div>

        {/* Back side */}
        <div
          className="absolute inset-0 rounded-xl shadow-lg flex flex-col justify-center items-center p-6 text-white"
          style={{
            backgroundColor: isLoaded
              ? `rgb(${dominantColor})`
              : 'rgb(70,112,160)',
            backgroundImage: isLoaded
              ? `linear-gradient(135deg, rgb(${dominantColor}), rgba(${dominantColor}, 0.8))`
              : 'linear-gradient(135deg, rgb(70,112,160), rgba(70,112,160, 0.8))',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">
              {content.companyName}
            </h3>
            <div className="w-16 h-0.5 bg-white/60 mx-auto mb-3 rounded-full"></div>
            <p className="text-sm text-white/90 font-medium">{title}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
export default CompanyCard
