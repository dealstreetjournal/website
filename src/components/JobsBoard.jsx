import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer).
//
// "Back to website" is a fixed overlay, not a layout bar -- it takes no space from
// the iframe, and stays at a constant spot in the viewport (position: fixed doesn't
// move with either document's scroll), below the board's own logo/header band.
//
// A scroll-reactive version (below the logo at rest, snapping to top-0 once the page
// scrolled) was tried and reverted here: it depended on the OUTER page actually
// scrolling, which only happens once the iframe's own internal content is exhausted.
// Measured live, the board's real content runs ~8x viewport height on mobile and
// ~4.7x on desktop, so in practice nearly all scrolling happens invisibly inside the
// iframe first -- cross-origin content means that internal scroll can never be read
// from here (confirmed earlier: no postMessage bridge in the board's own bundle
// either), so there's no way to react to it sooner. A fixed position sidesteps the
// problem instead of chasing an input we can't see.
export default function JobsBoard() {
  return (
    <div className="w-full h-screen relative">
      <Link
        to="/"
        title="Back to website"
        className="fixed top-20 left-3 z-50 flex items-center gap-1 bg-gray-900/60 hover:bg-gray-900/90 text-white text-[11px] font-aptos-semibold pl-2 pr-2.5 py-1.5 rounded-full shadow-md backdrop-blur-sm"
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
