import React from 'react'
import JobsSlider from '../components/JobsSlider'
import JobsSteps from '../components/JobsSteps'
import JobsFilter from '../components/JobsFilter'

const Jobs = () => {
  document.title = 'Jobs | DealStreetJournal'

  return (
    <div className="w-full">
      <JobsSlider />
      <JobsSteps />
      <JobsFilter />
    </div>
  )
}

export default Jobs
