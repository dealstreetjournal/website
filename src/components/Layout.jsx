import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import NavbarDesktop from './NavbarDesktop'
import NavbarMobile from './NavbarMobile'

const Layout = () => {
  return (
    <>
      <div className="hidden md:block">
        <NavbarDesktop />
      </div>
      <div className="block md:hidden">
        <NavbarMobile />
      </div>
      <main className="mt-18 lg:mt-23">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
