import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { FaCaretDown } from 'react-icons/fa6'
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa'

import { TbSeparator } from 'react-icons/tb'
import { Link, useParams } from 'react-router-dom'
import {
  WhatsappShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
} from 'react-share'
import spinner from '../assets/spinner.png'
import DsjInsight from '../components/DsjInsight'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { handleDate } from '../handleDate'
import SmartImage from '../components/SmartImage'
import { fetchBlogById } from '../api/blogApi'
import BlogSubCard from '../components/BlogSubCard'

const BlogDetails = () => {
  const { id } = useParams()
  const [currentUrl, setCurrentUrl] = useState('')
  const [finalHtml, setFinalHtml] = useState('')
  const [visibleSidebarCards, setVisibleSidebarCards] = useState(0)

  const leftColRef = useRef(null)
  const unlockRef = useRef(null)

  // Get current URL after component mounts
  useEffect(() => {
    setCurrentUrl(`https://web.dealstreetjournal.com/dsj/blog/${id}`)
  }, [id])

  const {
    isPending,
    isError,
    data: contents,
    error,
  } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => fetchBlogById(id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const blog = contents?.singleBlog
  const blogs = contents?.blogs

  const blogSorted = blogs?.sort(
    (a, b) => new Date(b.articleDate) - new Date(a.articleDate)
  )

  // const blog4Article = blogSorted?.slice(0, 4)

  // Calculate available space and determine number of cards to show
  const getHeightIfVisible = (ref) => {
    if (!ref?.current) return 0

    const el = ref.current
    const style = window.getComputedStyle(el)

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      el.offsetParent === null
    ) {
      return 0
    }

    return el.scrollHeight || 0
  }

  useLayoutEffect(() => {
    if (!leftColRef.current) return

    const calculate = () => {
      const leftHeight = leftColRef.current.scrollHeight

      const sidebarHeight = getHeightIfVisible(unlockRef)

      const remainingSpace = leftHeight - sidebarHeight
      const cardHeight = 150

      const cardsToShow = Math.floor(remainingSpace / cardHeight)

      setVisibleSidebarCards((prev) =>
        prev === cardsToShow ? prev : Math.max(0, cardsToShow)
      )
    }

    const ro = new ResizeObserver(calculate)

    ro.observe(leftColRef.current)
    unlockRef.current && ro.observe(unlockRef.current)

    window.addEventListener('resize', calculate)
    calculate()

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calculate)
    }
  }, [blogSorted, blog])

  // Show image at center when clicked
  function showPopup(src) {
    const popup = document.createElement('div')

    popup.style.position = 'fixed'
    popup.style.top = '0'
    popup.style.left = '0'
    popup.style.width = '100vw'
    popup.style.height = '100vh'
    popup.style.background = 'rgba(0,0,0,0.7)'
    popup.style.display = 'flex'
    popup.style.alignItems = 'center'
    popup.style.justifyContent = 'center'
    popup.style.zIndex = '9999'

    popup.innerHTML = `
      <img src="${src}" style="max-width:90%; max-height:90%; border-radius:6px;" />
    `

    popup.addEventListener('click', () => popup.remove())

    document.body.appendChild(popup)
  }

  // Handle image border and first letter bold and bigger
  useEffect(() => {
    if (!blog?.description) return

    const sanitized = DOMPurify.sanitize(blog.description)

    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized, 'text/html')

    const firstPara = doc.querySelector('p')

    if (firstPara) {
      const walker = document.createTreeWalker(
        firstPara,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )

      const textNode = walker.nextNode()
      if (textNode && textNode.nodeValue.trim().length > 0) {
        const originalText = textNode.nodeValue
        const firstChar = originalText.trim().charAt(0)

        // Remove only first visible character
        textNode.nodeValue = originalText.replace(firstChar, '')

        // Create drop cap span
        const span = document.createElement('span')
        span.className = 'drop-cap'
        span.textContent = firstChar

        // Insert before the textNode
        textNode.parentNode.insertBefore(span, textNode)
      }
    }

    doc.querySelectorAll('img').forEach((img) => {
      img.style.border = '1px solid lightgray'
      img.style.borderRadius = '4px'
      img.style.cursor = 'pointer'
    })

    const updatedHtml = doc.body.innerHTML
    setFinalHtml(updatedHtml)
  }, [blog])

  // Handle image zoom
  useEffect(() => {
    const container = document.getElementById('article-content')

    if (!container) return

    // When any element inside container is clicked
    const handleClick = (e) => {
      const img = e.target.closest('img')
      if (img) {
        showPopup(img.src)
      }
    }

    container.addEventListener('click', handleClick)

    return () => container.removeEventListener('click', handleClick)
  }, [finalHtml])

  // Prepare share data
  const shareTitle = blog?.title || 'Check this out!'
  const shareDescription =
    blog?.description?.replace(/<[^>]*>/g, '').slice(0, 200) || ''

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
      <div className="bg-slate-50 pb-5 w-full mx-auto">
        <div className="bg-gray-200 h-48">
          <div className="max-w-6xl mx-auto h-full"></div>
        </div>

        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <div className="md:grid md:grid-cols-[70%_30%] md:gap-6">
            {/* LEFT SIDE */}
            <div ref={leftColRef} className="h-fit">
              <div className="flex justify-start items-start text-[15px]">
                <Link
                  to={'/blog'}
                  className="font-aptos-bold whitespace-nowrap"
                >
                  Blog
                </Link>
                <TbSeparator className="mx-1 mt-1" />
                <p className="font-aptos-regular">{blog?.title}</p>
              </div>

              <h3 className="font-aptos-semibold text-[15px] text-white bg-gray-500 w-fit mt-6 px-2 py-1 rounded">
                {blog?.brandName}
              </h3>
              <h1 className="font-aptos-bold text-3xl my-3 text-[#ff7010]">
                {blog?.title}
              </h1>

              <SmartImage src={blog?.imageUrl} alt={blog?.brandName} />

              <p className="italic font-aptos-regular text-sm text-gray-400">
                Image Credit: {blog?.pcCredit || 'Deal Street Journal'}
              </p>

              <hr className="text-orange-400 mt-5" />

              {/* SOCIAL SHARE with react-share */}
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="flex justify-start items-center gap-1 font-aptos-semibold text-regular text-gray-800">
                    <FaUserCircle /> {blog?.writtenBy || 'Team DSJ'}
                  </p>
                  <p className="flex justify-start items-center gap-1 font-aptos-semibold text-sm text-gray-500">
                    <FaCalendarAlt />
                    {handleDate(blog.articleDate)}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  {/* WhatsApp Share */}
                  <WhatsappShareButton
                    url={currentUrl}
                    title={shareTitle}
                    separator=" - "
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>

                  {/* Twitter Share */}
                  <TwitterShareButton
                    url={currentUrl}
                    title={shareTitle}
                    hashtags={['DealStreetJournal', 'Startup']}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  {/* LinkedIn Share */}
                  <LinkedinShareButton
                    url={currentUrl}
                    title={shareTitle}
                    summary={shareDescription}
                    source="Deal Street Journal"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>

                  {/* Copy Link Button */}
                  <FacebookShareButton
                    url={currentUrl}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                </div>
              </div>

              <hr className="text-orange-400 mt-2" />

              {/* ARTICLE CONTENT */}
              <p
                id="article-content"
                className="font-aptos-regular text-lg mt-7 text-left"
                dangerouslySetInnerHTML={{
                  __html: finalHtml,
                }}
              ></p>

              <hr className="text-[#ff7010] my-5" />
            </div>

            {/* RIGHT SIDE */}
            <div className="mt-10 sm:mt-0 h-fit sticky top-5">
              <div ref={unlockRef}>
                <div className="flex flex-col justify-center items-center">
                  <hr className="w-[80%]" />
                  <h4 className="font-aptos-bold text-2xl text-[#ff7010]">
                    Unlock Insights
                  </h4>
                  <hr className="w-[80%]" />
                  <FaCaretDown />
                </div>

                <DsjInsight />

                <hr className="text-gray-400 mt-2 mb-4" />
              </div>

              {/* SIDEBAR DEALS */}
              <div>
                {blogSorted
                  ?.slice(
                    0,
                    window.innerWidth < 768
                      ? blogSorted.length
                      : visibleSidebarCards
                  )
                  .map((content) => (
                    <BlogSubCard
                      key={content.id}
                      id={content.id}
                      url={`/blog/${content.id}`}
                      image={content.imageUrl}
                      heading={content.title}
                      date={content.articleDate}
                      hide={true}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogDetails
