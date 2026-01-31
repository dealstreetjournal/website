import React from 'react'
import { Link } from 'react-router-dom'

const AboutUs = () => {
  document.title = 'About Us | DealStreetJournal'
  return (
    <>
      <div className="w-full bg-slate-50">
        <div className="max-w-6xl mx-auto w-[90%] py-8">
          <h1 className="font-aptos-bold text-3xl text-[#ff7010] mb-5">
            About Us
          </h1>

          <p className="font-aptos-regular text-base">
            Deal Street Journal (
            <Link to="/">
              <b className="text-[#ff7010]">DSJ</b>
            </Link>
            ) is a premier news and data platform dedicated to the new-age
            companies that are reshaping the world through their innovations. We
            focus on key aspects of the startup ecosystem, including fundraising
            across various stages (pre-seed, seed, growth), mergers and
            acquisitions, and initial public offerings (IPOs). Our mission is to
            keep our readers informed about the latest developments in the
            global startup landscape.
            <br />
            <br />
            In addition to news, DSJ offers in depth and insightful data reports
            that provides latest information on fund raising, investor
            participation, valuation multiples and financial information related
            to emerging companies. Our uniquely design data product “
            <Link to="/dsj-insight">
              <b className="text-[#ff7010]">DSJ Insights</b>
            </Link>
            ”, has following three products:
            <br />
            <br />
            •&nbsp;
            <Link
              to="/latest"
              className="hover:text-[#ff7010] transition-all duration-300"
            >
              <b>⁠DSJ Latest Deal Insights</b>
            </Link>
            <br />
            •&nbsp;
            <Link
              to="/funding"
              className="hover:text-[#ff7010] transition-all duration-300"
            >
              <b>⁠DSJ Funding 365</b>
            </Link>
            <br />
            •&nbsp;
            <Link
              to="/financial"
              className="hover:text-[#ff7010] transition-all duration-300"
            >
              <b>⁠DSJ Financial Insights</b>
            </Link>
            <br />
            <br />
            We strive to provide our readers with unbiased and noise free
            organic information, empowering them to make informed decisions in
            this dynamic and rapidly evolving ecosystem.
          </p>
        </div>
      </div>
    </>
  )
}

export default AboutUs
