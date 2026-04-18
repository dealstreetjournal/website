import React from 'react'
import { Link } from 'react-router-dom'
import { handleDate } from '../handleDate'

const HomeWorldSection = ({ data }) => {
  const worlds = data || []

  return (
    <>
      <div className="bg-[#F8F9FA] w-full mx-auto py-10">
        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto relative">
          <h1 className="text-4xl font-aptos-bold">World</h1>
          <div className="flex flex-col sm:flex-row justify-start items-center gap-5">
            {worlds &&
              worlds.length > 0 &&
              worlds.map((world, index) => {
                return (
                  <Link
                    to={`/world/${world.slug}`}
                    key={world.id}
                    className={`sm:w-[270px] mx-auto mt-5 bg-white shadow rounded-lg overflow-clip ${
                      index >= 3 ? 'md:hidden lg:block' : ''
                    }`}
                  >
                    <img
                      src={world.imageUrl}
                      alt={world.title}
                      loading="lazy"
                      className=" object-cover object-center w-full h-[180px] md:h-[130px] lg:h-[150px] xl:h-[170px]"
                    />

                    <div className="flex flex-wrap justify-between items-top px-3 mt-3 font-aptos-regular text-sm">
                      <p className="text-[#ff7010] font-aptos-semibold">
                        {world.brandName}
                      </p>
                      <p className="whitespace-nowrap text-gray-500">
                        {handleDate(world.articleDate)}
                      </p>
                    </div>

                    <p
                      className="font-aptos-regular line-clamp-3 px-3 my-3"
                      title={world.title}
                    >
                      {world?.title}
                    </p>
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
