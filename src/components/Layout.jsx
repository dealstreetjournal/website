import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import NavbarDesktop from './NavbarDesktop'
import NavbarMobile from './NavbarMobile'
import useContentProtection from './useContentProtection'
import { JOBS_SITE_URL, jobsSiteUrl } from '../utils/jobsLink'

// Scoped here (not in App.jsx) rather than applied globally — every route EXCEPT
// AiSearchPage renders through this Layout (see App.jsx's router: /company-ai is a
// sibling route outside <Layout/>), so the site's anti-scraping copy/select/right-click
// block still covers paid report content everywhere it always has, while the AI
// Search page — a ChatGPT-style tool where copying the answer is the whole point —
// is naturally exempt without needing any route-matching logic of its own.

const DSJ_INSIGHTS_PATHS = ['/latest', '/funding', '/financial']

const Layout = () => {
  useContentProtection()
  const { pathname } = useLocation()
  const isDsjInsightsPage = DSJ_INSIGHTS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  return (
    <>
      <div className="hidden md:block">
        <NavbarDesktop />
      </div>
      <div className="block md:hidden">
        <NavbarMobile />
      </div>
      <main className="relative min-h-screen mt-18 lg:mt-23">

        {!isDsjInsightsPage && (
          <div className="md:hidden absolute top-3 right-4 z-10">
            <a
              href={JOBS_SITE_URL}
              onClick={(e) => { e.preventDefault(); window.location.assign(jobsSiteUrl()) }}
              className="dsj-jobs-gradient-btn cursor-pointer whitespace-nowrap font-semibold px-4 py-1 rounded shadow-sm hover:brightness-110 transition"
            >
              Jobs
            </a>
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
