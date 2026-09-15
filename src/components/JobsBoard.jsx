import { Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaBriefcase } from 'react-icons/fa'

// The real job board -- opened in a new tab on click, not embedded in an iframe.
// Every iframe attempt hit a hard, unfixable wall: the board's own CORS policy blocks
// this site's production domain outright (confirmed live, repeatedly), reading its
// scroll position cross-origin is flatly impossible (no browser exposes it, and the
// board's own bundle has no postMessage bridge to work around that), and its own
// links carry a hardcoded target="_blank" baked into ITS compiled JS (confirmed by
// reading that bundle directly) that this page has no way to override from outside.
// A plain outbound link sidesteps every one of those -- on request.
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer), so it
// needs its own "Back to website" the same way that page does.
export default function JobsBoard() {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-[#3a1a05]">
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <FaBriefcase className="text-5xl text-[#ff7010] mb-6" />
        <h1 className="text-3xl md:text-4xl font-aptos-semibold text-white mb-3">Find Your Role</h1>
        <p className="text-gray-400 font-aptos-regular max-w-md mb-8">
          Browse every open position on the DealStreetJournal job board — updated as new roles open up.
        </p>
        <a
          href={JOB_BOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#ff7010] hover:bg-orange-600 text-white font-aptos-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          View All Job Openings
          <FaArrowRight className="text-sm" />
        </a>
        <p className="text-gray-500 text-xs font-aptos-regular mt-4">Opens in a new tab — job.dealstreetjournal.com</p>
      </div>
    </div>
  )
}
