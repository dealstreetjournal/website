import { useEffect } from 'react'
import config from '../config'
import { jobsSiteUrl } from '../utils/jobsLink'

// The job board lives on its own domain; /jobs (old links, bookmarks) forwards there with
// ref=dsj, so the board shows its "Back to website" button returning to the home page.
const Jobs = () => {
  useEffect(() => {
    window.location.replace(jobsSiteUrl(`${config.SITE_URL}/`))
  }, [])
  return null
}

export default Jobs
