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
//
// "Back to website" -- gave up on floating it OVER the iframe (tried every corner,
// each one collided with something in the board's own header: logo top-left, Login
// top-right; a scroll-reactive top-0 snap was tried next but can't work at all --
// JS genuinely cannot read scroll position inside a cross-origin iframe, and that's
// where the actual scrolling happens, not on this outer page). A real, separate
// strip ABOVE the iframe instead -- thin enough (32px) that it doesn't read as a
// second navbar the way the first, taller version of this did, but since it's not
// overlaid on the board at all, nothing inside the iframe can ever collide with it,
// scroll position included.
export default function JobsBoard() {
  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <div className="flex-shrink-0 h-8 bg-gray-900 flex items-center px-3">
        <Link
          to="/"
          title="Back to website"
          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-[11px] font-aptos-semibold"
        >
          <FaArrowLeft className="text-[10px]" />
          Back to website
        </Link>
      </div>

      <iframe
        src={JOB_BOARD_URL}
        title="DealStreetJournal Job Openings"
        className="w-full flex-1 border-0 block"
      />
    </div>
  )
}
