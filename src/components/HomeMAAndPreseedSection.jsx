import React from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'

const HomeMAAndPreeseedSection = ({ maData, preseedData }) => {
  const mas = maData || []
  const preseeds = preseedData || []

  const sanitizeDescription = (desc) => {
    const sanitizeDesc = DOMPurify.sanitize(desc)
    return sanitizeDesc
  }

  return (
    <>
      <div className="w-full bg-[#F8F9FA] py-10">
        <div className="max-w-6xl mx-auto w-[90%] grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-4 lg:gap-8">
          {/* M&A-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              M & A
            </h1>
            {mas && mas.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <h1 className="text-lg font-aptos-regular text-gray-800 p-3 line-clamp-2">
                  {mas[0]?.title}
                </h1>

                <Link to={`ma/${mas[0]?.id}`}>
                  <img
                    src={mas[0]?.imageUrl}
                    alt={mas[0]?.title || 'Article image'}
                    loading="lazy"
                    className="w-full h-58 md:h-68 xl:h-78 object-cover object-center"
                  />

                  <div className="flex justify-between items-start my-3 px-3 font-aptos-regular text-sm">
                    <p className="text-[#ff7010] font-aptos-semibold">
                      {mas[0]?.brandName}
                    </p>
                    <p className="whitespace-nowrap text-gray-500">
                      {handleDate(mas[0]?.articleDate)}
                    </p>
                  </div>

                  <p
                    className="font-aptos-regular text-gray-600 line-clamp-7 px-3 pb-3 overflow-clip"
                    title={mas[0]?.title}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeDescription(mas[0]?.description),
                    }}
                  ></p>
                </Link>
              </div>
            )}
          </div>

          {/* preseed-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              Pre Seed
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-3 lg:gap-5">
              {preseeds &&
                preseeds.length > 0 &&
                preseeds.map((content) => (
                  <Link
                    to={`preseed/${content.id}`}
                    key={content.id}
                    className="bg-white overflow-clip rounded-lg shadow"
                  >
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      loading="lazy"
                      className=" object-cover object-center w-full h-[180px] md:h-[130px] lg:h-[150px] xl:h-[170px]"
                    />

                    <div className="flex md:flex-col lg:flex-row justify-between items-top px-3 mt-3 font-aptos-regular text-sm">
                      <p className="text-[#ff7010] font-aptos-semibold">
                        {content.brandName}
                      </p>
                      <p className="whitespace-nowrap text-gray-500">
                        {handleDate(content.articleDate)}
                      </p>
                    </div>
                    <p
                      className="font-aptos-regular line-clamp-3 px-3 my-3"
                      title={content.title}
                    >
                      {content.title}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeMAAndPreeseedSection
