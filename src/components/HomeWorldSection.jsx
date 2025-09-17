import React from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'

const HomeWorldSection = ({ data }) => {
  const worlds = data || []

  const sanitizeDescription = (desc) => {
    const sanitizeDesc = DOMPurify.sanitize(desc)
    return sanitizeDesc
  }

  return (
    <>
      <div className="bg-slate-200 w-full mx-auto py-10">
        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto relative">
          <h1 className="text-4xl font-aptos-bold">World</h1>
          <div className="flex flex-col sm:flex-row justify-start items-center gap-5">
            {worlds &&
              worlds.length > 0 &&
              worlds.map((world, index) => {
                return (
                  <Link
                    to={`/world/${world.id}`}
                    key={world.id}
                    className={`sm:w-[300px] mt-5 ${
                      index >= 3 ? 'md:hidden lg:block' : ''
                    }`}
                  >
                    <img
                      src={world.imageUrl}
                      alt="image"
                      className=" object-cover w-full h-[180px] md:h-[130px] lg:h-[150px] xl:h-[180px] rounded-md shadow-md sm:shadow-lg mb-3 md:mb-4 xl:mb-5"
                    />

                    <p
                      className="font-aptos-regular line-clamp-4"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeDescription(world?.description),
                      }}
                    ></p>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeWorldSection
