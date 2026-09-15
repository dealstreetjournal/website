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
  // "Back to website" floats below the board's own logo at rest (top-20, clearing its
  // header band -- top-3 sat on the logo directly), and snaps to top-0 the moment THIS
  // page's own window scrolls, back to top-20 once it scrolls back to the top. IMPORTANT
  // caveat, on request but worth stating plainly: this can only ever react to a scroll
  // on window (this outer page) -- it structurally CANNOT react to scrolling inside the
  // iframe itself (the job listings), because no browser lets parent-page JS read a
  // cross-origin iframe's scroll position at all. If the visible scrolling is happening
  // inside the embedded board, this button will stay parked at top-20 throughout, not a
  // bug in this code, a hard security boundary every browser enforces the same way.
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
