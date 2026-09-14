import axios from './axiosInstance'

// Proxied through websitebackend (see JobsController/JobsService there), not called
// directly from the browser -- the upstream job-board API's own CORS allowlist only
// covers job.dealstreetjournal.com and local dev origins, not this site's production
// domain, so a direct client-side fetch would be blocked in production.
export const getJobs = async () => {
  const response = await axios.get('/dsj/jobs')
  return Array.isArray(response.data) ? response.data : []
}
