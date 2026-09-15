import { Link } from 'react-router-dom'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'

// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

export default function JobsBoard() {
  return (
    <div className="w-full bg-[#F8F9FA] py-16">
      <div className="max-w-6xl w-[90%] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-aptos-semibold text-gray-900">Find Your Role</h2>
            <p className="text-gray-600 font-aptos-regular mt-1">
              Browse current openings below, or open the full job board in a new tab.
            </p>
          </div>
          <a
            href={JOB_BOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#ff7010] font-aptos-semibold text-sm hover:underline flex-shrink-0"
          >
            Open in new tab
            <FaExternalLinkAlt className="text-xs" />
          </a>
        </div>

        <div className="rounded-2xl shadow-md overflow-hidden border border-gray-200 bg-white">
          {/* This bar exists only because the iframe below fills the whole card --
              without it, a visitor who clicks into a job on the embedded board has
              no obvious way back to the rest of this site without using the
              browser's own back button. */}
          <div className="flex items-center gap-3 bg-gray-900 px-4 py-2.5">
            <Link
              to="/"
              title="Back to website"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs font-aptos-semibold flex-shrink-0"
            >
              <FaArrowLeft className="text-[11px]" />
              Back to website
            </Link>
            <span className="text-gray-500 text-xs ml-auto truncate font-aptos-regular">
              job.dealstreetjournal.com
            </span>
          </div>
          <iframe
            src={JOB_BOARD_URL}
            title="DealStreetJournal Job Openings"
            className="w-full border-0 block"
            style={{ height: '80vh', minHeight: 560 }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
