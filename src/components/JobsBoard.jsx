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
// "Back to website" is a small FLOATING button over the iframe, not a full-width bar
// above it -- found live: a full bar stacked right on top of the job board's own
// header read as two navbars on top of each other, and it also ate into the "full
// page" space the board was asked to have.
export default function JobsBoard() {
  return (
    <div className="w-full h-screen relative bg-white">
      <Link
        to="/"
        title="Back to website"
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gray-900/85 hover:bg-gray-900 text-white text-xs font-aptos-semibold pl-2.5 pr-3 py-2 rounded-full shadow-lg backdrop-blur-sm transition-colors"
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
