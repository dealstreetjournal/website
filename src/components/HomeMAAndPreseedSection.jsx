import React from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'

const HomeMAAndPreeseedSection = ({ maData, preseedData }) => {
  const mas = maData || []
  const preseeds = preseedData || []

  const sanitizeDescription = (desc) => {
    const sanitizeDesc = DOMPurify.sanitize(desc)
    return sanitizeDesc
  }

  return (
    <>
      <div className="w-full bg-slate-200 py-10">
        <div className="max-w-6xl mx-auto w-[90%] grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-4 lg:gap-8">
          {/* M&A-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              M & A
            </h1>
            {mas && mas.length > 0 && (
              <Link to={`ma/${mas[0].id}`} className="mb-5">
                <img
                  src={mas[0]?.imageUrl}
                  alt={mas[0]?.title}
                  loading="lazy"
                  className="rounded-md w-full h-58 md:h-68 xl:h-78 object-cover mb-3"
                />

                <p
                  className="font-aptos-regular line-clamp-10 mb-2.5"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescription(mas[0]?.description),
                  }}
                ></p>
                <hr className="text-[#ff7010]" />
              </Link>
            )}
          </div>

          {/* preseed-section */}
          <div className="">
            <h1 className="text-4xl font-aptos-bold mb-8 pb-3 border-b border-[#ff7010]">
              Pre Seed
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-x-3 md:gap-y-0 lg:gap-x-5 lg:gap-y-0 xl:gap-5">
              {preseeds &&
                preseeds.length > 0 &&
                preseeds.map((content) => (
                  <Link
                    to={`preseed/${content.id}`}
                    key={content.id}
                    className="border-b border-[#ff7010] pb-3 mb-4.5 md:pb-1 md:mb-3 xl:pb-3 xl:mb-4.5"
                  >
                    <div className="flex justify-center items-center w-full h-[170px] border-2 bg-slate-300 border-slate-400 rounded">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        loading="lazy"
                        className="w-[130px] h-[130px] object-contain object-center rounded-md"
                      />
                    </div>
                    <p
                      className="font-aptos-regular line-clamp-4"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeDescription(content?.description),
                      }}
                    ></p>
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
