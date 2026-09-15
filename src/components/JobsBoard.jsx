import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer).
//
// The iframe is deliberately NOT height-constrained to the viewport (no h-screen/
// h-full/flex-1) -- it's given a large fixed height instead, taller than any one
// screen. That's what makes the scroll listener below actually work: with a
// viewport-sized iframe, ALL scrolling happens inside the iframe's own internal
// scrollbar, which parent-page JS categorically cannot read (no browser exposes a
// cross-origin iframe's scroll position at all -- confirmed live that this board's
// own bundle has no postMessage support to work around it either). Oversizing the
// iframe means the embedded page rarely needs its own internal scrollbar at all --
// the OUTER document scrolls instead, through completely ordinary page scrolling,
// which window.scrollY reads just fine.
const IFRAME_HEIGHT = '400vh'

export default function JobsBoard() {
  // "Back to website" floats below the board's own logo at rest (top-20, clearing its
  // header band -- top-3 sat on the logo directly), and snaps to top-0 once the page
  // scrolls, back to top-20 once scrolled back to the top.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="w-full min-h-screen relative bg-white">
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
        className="w-full border-0 block"
        style={{ height: IFRAME_HEIGHT }}
      />
    </div>
  )
}
