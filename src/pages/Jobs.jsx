import React from 'react'
import JobsBoard from '../components/JobsBoard'

// Runs full-screen, outside <Layout/> (see App.jsx's own /jobs route) -- the embedded
// job board fills the whole viewport instead of sitting below the site's own hero/
// steps/header/footer chrome, the same "niche nahi, full page pe" ask this page used
// to fall short of when JobsSlider/JobsSteps pushed the actual board down the page.
const Jobs = () => {
  document.title = 'Jobs | DealStreetJournal'

  return <JobsBoard />
}

export default Jobs
