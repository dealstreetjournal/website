// The job board's own site -- no X-Frame-Options / frame-ancestors restriction
// (checked live), so it can be embedded directly instead of re-fetching and
// re-rendering its own listings through the public jobs API, which the API's own
// CORS policy blocks from this site's production domain (confirmed live, repeatedly).
const JOB_BOARD_URL = 'https://job.dealstreetjournal.com/'

// Full-screen, same as AiSearchPage.jsx -- this component IS the entire /jobs route
// (see App.jsx: that route sits outside <Layout/>, no site header/footer). No "Back
// to website" button anymore (removed on request) -- just the board itself, filling
// the whole viewport with its own natural internal scrolling. Whatever a visitor
// clicks inside it (a specific job, "Apply", etc.) opens wherever the board's own
// HTML sends it -- that's entirely the embedded site's own link behavior, not
// something this page can see or control at all (cross-origin content).
export default function JobsBoard() {
  return (
    <iframe
      src={JOB_BOARD_URL}
      title="DealStreetJournal Job Openings"
      className="w-full h-screen border-0 block"
    />
  )
}
