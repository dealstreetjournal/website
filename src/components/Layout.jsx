import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import NavbarDesktop from './NavbarDesktop'
import NavbarMobile from './NavbarMobile'
import useContentProtection from './useContentProtection'

// Scoped here (not in App.jsx) rather than applied globally — every route EXCEPT
// AiSearchPage renders through this Layout (see App.jsx's router: /company-ai is a
// sibling route outside <Layout/>), so the site's anti-scraping copy/select/right-click
// block still covers paid report content everywhere it always has, while the AI
// Search page — a ChatGPT-style tool where copying the answer is the whole point —
// is naturally exempt without needing any route-matching logic of its own.
const Layout = () => {
  useContentProtection()

  return (
    <>
      <div className="hidden md:block">
        <NavbarDesktop />
      </div>
      <div className="block md:hidden">
        <NavbarMobile />
      </div>
      <main className="min-h-screen mt-18 lg:mt-23">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
