// Called directly from the browser, on request -- the job board's own public API, not
// routed through websitebackend. Plain fetch(), not the shared axiosInstance: that
// instance is scoped to THIS site's own backend (baseURL + withCredentials), neither of
// which belongs on a request to a different, third-party domain.
const JOBS_API_URL = 'https://jobs.dealstreetjournal.com/api/public/jobs'

export const getJobs = async () => {
  const response = await fetch(JOBS_API_URL)
  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data) ? data : []
}
