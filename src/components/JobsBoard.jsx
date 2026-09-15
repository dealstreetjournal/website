import { Link } from 'react-router-dom'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'

// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer), so the
// embedded board gets the whole viewport instead of a boxed-in section pushed down by
// the site's own hero/steps/header/footer chrome.
export default function JobsBoard() {
  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Slim top bar — navigation only. This page has no site header/footer of its
          own to navigate from otherwise (same reasoning as AiSearchPage.jsx's own
          "Back to website"), and a visitor who clicks into a job on the embedded
          board still needs an obvious way back besides the browser's own button. */}
      <div className="flex-shrink-0 bg-gray-900 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          title="Back to website"
          className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs font-aptos-semibold flex-shrink-0"
        >
          <FaArrowLeft className="text-[11px]" />
          Back to website
        </Link>
        <div className="w-px h-4 bg-white/10 flex-shrink-0" />
        <span className="text-gray-400 text-xs font-aptos-semibold truncate">Careers at DealStreetJournal</span>
        <a
          href={JOB_BOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs font-aptos-semibold flex-shrink-0"
        >
          <span className="hidden sm:inline">Open in new tab</span>
          <FaExternalLinkAlt className="text-[10px]" />
        </a>
      </div>

      <iframe
        src={JOB_BOARD_URL}
        title="DealStreetJournal Job Openings"
        className="w-full flex-1 border-0 block"
      />
    </div>
  )
}
