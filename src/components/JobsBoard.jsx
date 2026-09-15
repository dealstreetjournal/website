import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer), so it
// needs its own "Back to website" the same way that page does. Everything else
// inside the iframe -- a specific job, "Apply", footer links -- opens wherever the
// board's own HTML sends it (its own domain); that's the embedded site's own link
// behavior and isn't something this page can see or control (cross-origin content).
export default function JobsBoard() {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      <div className="flex-shrink-0 px-4 py-3">
        <Link
          to="/"
          title="Back to website"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-aptos-semibold"
        >
          <FaArrowLeft className="text-[11px]" />
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
