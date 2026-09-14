import axios from './axiosInstance'

// Proxied through websitebackend (see JobsController/JobsService there), not called
// directly from the browser. Confirmed live: a direct fetch() from this site's own
// production origin gets 403'd by the job board's own CORS policy (typing the same URL
// straight into a browser's address bar works fine, since a top-level navigation never
// sends the Origin header a script-initiated fetch() does -- the two looked
// contradictory until tested with an actual Origin header, which reproduced the
// browser-console 403 exactly). A direct client-side call was tried and reverted once
// for this reason.
export const getJobs = async () => {
  const response = await axios.get('/dsj/jobs')
  return Array.isArray(response.data) ? response.data : []
}
