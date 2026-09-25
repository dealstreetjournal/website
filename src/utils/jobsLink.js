import config from '../config'

export const JOBS_SITE_URL = 'https://job.dealstreetjournal.com/'

// The job board shows a "Back to website" button only when opened with ref=dsj, and sends
// the visitor back to `returnUrl` (it only accepts a dealstreetjournal.com address).
export const jobsSiteUrl = (returnUrl = window.location.href) => {
  const url = new URL(JOBS_SITE_URL)
  url.searchParams.set('ref', 'dsj')
  url.searchParams.set('return', returnUrl || `${config.SITE_URL}/`)
  return url.toString()
}
