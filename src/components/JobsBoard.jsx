import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer), so the
// embedded board gets the whole viewport.
export default function JobsBoard() {
  // "Back to website" is a small FLOATING button over the iframe, not a full-width bar
  // above it -- a full bar stacked right on top of the job board's own header read as
  // two navbars on top of each other, found live, and it also ate into the "full
  // page" space the board was asked to have. Starts pushed down (top-20) to clear the
  // board's own logo/header band, then snaps to top-0 the moment the PAGE itself
  // scrolls (window scroll -- this is our own page, not the cross-origin iframe
  // content, which JS genuinely cannot read the scroll position of at all) -- on
  // request, so it hugs the very top edge once scrolling starts instead of staying
  // parked below the header the whole time.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="w-full h-screen relative bg-white">
      <Link
        to="/"
        title="Back to website"
        className={`fixed left-3 z-50 flex items-center gap-1 bg-gray-900/60 hover:bg-gray-900/90 text-white text-[11px] font-aptos-semibold pl-2 pr-2.5 py-1.5 rounded-full shadow-md backdrop-blur-sm transition-all ${
          scrolled ? 'top-0' : 'top-20'
        }`}
      >
        <FaArrowLeft className="text-[11px]" />
        Back to website
      </Link>

      <iframe
        src={JOB_BOARD_URL}
        title="DealStreetJournal Job Openings"
        className="w-full h-full border-0 block"
      />
    </div>
  )
}
