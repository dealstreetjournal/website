import React, { useState } from 'react'
import DealsCard from '../components/DealsCard'
import Pagination from '../components/Pagination'
import { useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import BlogRightCard from '../components/BlogRightCard'
import BlogCard from '../components/BlogCard'
import { fetchBlog } from '../api/blogApi'

const Blog = () => {
  const categories = []
  const [clickedCategory, setClickedCategory] = useState(null)

  const [page, setPage] = useState(1)

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['blogs', page],
    queryFn: () => fetchBlog(page),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  console.log('Fetched blog data:', data)

  data?.blogs?.forEach((blog) => {
    if (blog.category && !categories.includes(blog.category)) {
      categories.push(blog.category)
    }
  })

  console.log('Unique categories:', categories)

  const leftContents =
    clickedCategory === 'all' || clickedCategory === null
      ? data?.blogs.slice(0, 10) || []
      : data?.blogs.slice(0, 10).filter((blog) => {
          return blog.category === clickedCategory
        })

  // const leftContents = data?.blogs.slice(0, 10) || []

  const rightContents =
    clickedCategory === 'all' || clickedCategory === null
      ? data?.blogs.slice(10) || []
      : data?.blogs.slice(10).filter((blog) => {
          return blog.category === clickedCategory
        })

  // const rightContents = data?.blogs.slice(10) || []
  const totalPages = Math.ceil((data?.totalCount || 0) / 20)

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          loading="lazy"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <>
      <div className=" bg-[#F8F9FA] pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <h1 className="font-aptos-bold text-4xl text-gray-800 mt-5 mb-2">
            Blogs
          </h1>

          <span
            onClick={() => setClickedCategory('all')}
            className="cursor-pointer inline-block bg-orange-300/50 text-orange-700 px-3 pt-1 pb-1.5 rounded-full mr-2 mb-5 text-base font-aptos-semibold"
          >
            All
          </span>

          {categories.length > 0 &&
            categories.map((cat, idx) => (
              <span
                key={idx}
                onClick={() => setClickedCategory(cat)}
                className="cursor-pointer inline-block bg-orange-300/50 text-orange-700 px-3 pt-1 pb-1.5 rounded-full mr-2 mb-5 text-base font-aptos-semibold"
              >
                {cat}
              </span>
            ))}
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-5 lg:gap-10">
            <div className="">
              {leftContents.map((content, index, arr) => (
                <BlogCard
                  key={content.id}
                  index={index}
                  array={arr}
                  url={`/blog/${content.id}`}
                  company={content.brandName}
                  image={content.imageUrl}
                  heading={content.title}
                  desc={content.description}
                  date={content.articleDate}
                  writtenBy={content?.writtenBy || 'Team DSJ'}
                />
              ))}
            </div>

            {rightContents.length > 0 && (
              <div className="sm:border sm:border-gray-300 sm:rounded-lg sm:p-6">
                <div className="sticky top-1">
                  <div className="hidden md:flex justify-between items-center mr-2 mb-5">
                    <h5 className="font-aptos-bold text-gray-800 md:text-xl lg:text-2xl">
                      Previous Articles
                    </h5>
                  </div>

                  {rightContents.map((content, index, arr) => (
                    <BlogRightCard
                      key={content.id}
                      url={`/blog/${content.id}`}
                      index={index}
                      array={arr}
                      // deal={dealTitle}
                      company={content.brandName}
                      image={content.imageUrl}
                      desc={content.description}
                      heading={content.title}
                      date={content.articleDate}
                      writtenBy={content?.writtenBy || 'Team DSJ'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center">
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Blog
