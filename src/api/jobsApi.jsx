import axios from 'axios'

const JOBS_API_URL =
  'https://jobs.dealstreetjournal.com/api/public/jobs'

/**
 * Fetch jobs directly from DealStreetJournal public jobs API.
 */
export const getJobs = async () => {
  const response = await axios.get(JOBS_API_URL)

  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data
}