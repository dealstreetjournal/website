import React from 'react'
import JobsSlider from '../components/JobsSlider'
import JobsSteps from '../components/JobsSteps'
import JobsBoard from '../components/JobsBoard'

const Jobs = () => {
  document.title = 'Jobs | DealStreetJournal'

  return (
    <div className="w-full">
      <JobsSlider />
      <JobsSteps />
      <JobsBoard />
    </div>
  )
}

export default Jobs
