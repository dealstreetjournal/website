import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import { getJobs } from '../api/jobsApi'
import {
  FaMapMarkerAlt,
  FaClock,
  FaSearch,
  FaArrowRight,
  FaBuilding,
  FaBriefcase,
} from 'react-icons/fa'

// Fallback destination for a job the API doesn't carry its own direct link for -- the
// live job board's own homepage, same external site every card already opened before
// this API was wired in.
const JOB_LISTINGS_URL = 'https://job.dealstreetjournal.com/'

// Department-themed color panel — icon-only, no photography, for this grid. Unknown/
// real department names not in this list fall back to DEFAULT_THEME below, same as
// before -- this only covers the handful of departments the design was themed around.
const THEME_COLORS = {
  'Finance & Research': 'from-emerald-500 to-teal-700',
  'Sales & Growth': 'from-sky-500 to-indigo-700',
  Editorial: 'from-fuchsia-500 to-purple-700',
  Technology: 'from-[#ff7010] to-rose-700',
}
const DEFAULT_THEME = 'from-[#ff7010] to-orange-800'

const ALL_DEPARTMENTS = 'All Departments'
const ALL_LOCATIONS = 'All Locations'
const ALL_TYPES = 'All Types'
const BATCH_SIZE = 9

// Pulls the first present value out of a real job record across a few plausible field
// names -- the upstream API has zero live postings to sample a schema from, so this
// stays tolerant of common REST naming variants instead of assuming one exact shape.
const pick = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

const normalizeJob = (raw, index) => ({
  id: pick(raw, 'id', '_id', 'slug', 'jobId') ?? `job-${index}`,
  title: pick(raw, 'title', 'jobTitle', 'name', 'position') || 'Open Position',
  department: pick(raw, 'department', 'category', 'team', 'function') || 'General',
  location: pick(raw, 'location', 'city', 'jobLocation', 'workLocation') || 'Not specified',
  type: pick(raw, 'type', 'jobType', 'employmentType', 'employmentMode') || 'Full Time',
  // Wherever this specific posting's own page lives on the job board -- clicking the
  // card opens THIS, falling back to the board's homepage only when the API genuinely
  // doesn't send a per-job link.
  url: pick(raw, 'url', 'applyUrl', 'applicationUrl', 'link', 'jobUrl', 'postingUrl') || JOB_LISTINGS_URL,
})

export default function JobsFilter() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [department, setDepartment] = useState(ALL_DEPARTMENTS)
  const [location, setLocation] = useState(ALL_LOCATIONS)
  const [jobType, setJobType] = useState(ALL_TYPES)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    let cancelled = false
    getJobs()
      .then((data) => {
        if (cancelled) return
        setJobs(data.map(normalizeJob))
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Filter option lists reflect whatever departments/locations/types the LIVE postings
  // actually carry, not a fixed guess -- new ones appear automatically as real jobs are
  // added, and nothing shows an option with zero matching openings behind it.
  const departments = useMemo(
    () => [ALL_DEPARTMENTS, ...new Set(jobs.map((j) => j.department))],
    [jobs]
  )
  const locations = useMemo(() => [ALL_LOCATIONS, ...new Set(jobs.map((j) => j.location))], [jobs])
  const jobTypes = useMemo(() => [ALL_TYPES, ...new Set(jobs.map((j) => j.type))], [jobs])

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          (department === ALL_DEPARTMENTS || j.department === department) &&
          (location === ALL_LOCATIONS || j.location === location) &&
          (jobType === ALL_TYPES || j.type === jobType)
      ),
    [jobs, department, location, jobType]
  )

  // A filter change can leave visibleCount past the new (smaller) result set, or the
  // very first successful load can arrive after this already mounted at its default --
  // reset to the first batch whenever the filtered set itself changes.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [department, location, jobType, jobs])

  const hasMore = visibleCount < filteredJobs.length

  // Reveals the next batch a little while after the sentinel scrolls into
  // view, so more openings keep loading in as the visitor scrolls down.
  useEffect(() => {
    if (!inView || !hasMore) return
    const timer = setTimeout(() => {
      setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredJobs.length))
    }, 350)
    return () => clearTimeout(timer)
  }, [inView, hasMore, filteredJobs.length])

  const goToListings = () => {
    window.open(JOB_LISTINGS_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="w-full bg-[#F8F9FA] py-16">
      <div className="max-w-6xl w-[90%] mx-auto">
        <h2 className="text-2xl md:text-3xl font-aptos-semibold text-gray-900 text-center mb-2">
          Find Your Role
        </h2>
        <p className="text-gray-600 font-aptos-regular text-center mb-8">
          Filter openings by department, location or job type.
        </p>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-12">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">
            <FaBuilding className="text-[#ff7010] shrink-0" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">
            <FaMapMarkerAlt className="text-[#ff7010] shrink-0" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">
            <FaClock className="text-[#ff7010] shrink-0" />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={goToListings}
            className="flex items-center justify-center gap-2 bg-[#ff7010] hover:bg-orange-600 text-white font-aptos-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <FaSearch />
            Search Jobs
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-2 text-gray-500 font-aptos-regular text-sm">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#ff7010] animate-spin" />
              Loading openings...
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FaBriefcase className="text-4xl text-gray-300" />
            <p className="text-gray-600 font-aptos-semibold">
              {loadFailed || jobs.length === 0
                ? 'No open positions right now — check back soon!'
                : 'No openings match these filters — try broadening your search.'}
            </p>
            <button
              onClick={goToListings}
              className="text-[#ff7010] font-aptos-semibold text-sm hover:underline"
            >
              View the full job board →
            </button>
          </div>
        ) : (
          <>
            {/* Openings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredJobs.slice(0, visibleCount).map((job, index) => (
                <Reveal key={job.id} delay={(index % 3) * 100} className="h-full">
                  <TiltCard
                    as="a"
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    maxTilt={5}
                    className="group relative block h-full rounded-2xl p-[2px]"
                  >
                    {/* Flowing gradient border — invisible at rest, sweeps across
                        the edge on hover, same treatment as the steps above. */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #ff7010, #ffd08a, #ff7010, #ffd08a, #ff7010)',
                        backgroundSize: '300% 100%',
                        animation: 'borderFlow 2.5s linear infinite',
                      }}
                    />
                    <div className="relative bg-white rounded-[14px] shadow-md group-hover:shadow-xl overflow-hidden transition-shadow duration-300 h-full flex flex-col">
                      <div
                        className={`h-40 w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${
                          THEME_COLORS[job.department] || DEFAULT_THEME
                        }`}
                      >
                        <FaBriefcase className="absolute -bottom-3 -right-3 text-8xl text-white/10 rotate-12" />
                        <FaBriefcase className="relative text-5xl text-white/90 transition-transform duration-300 group-hover:scale-110" />
                        <span className="absolute top-3 left-3 bg-white/95 text-[#ff7010] font-aptos-semibold text-xs px-3 py-1 rounded-full shadow transition-transform duration-300 group-hover:scale-105">
                          {job.type}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="font-aptos-semibold uppercase tracking-wide text-xs text-[#ff7010]">
                          {job.department}
                        </span>
                        <h3 className="font-aptos-semibold text-gray-900 mt-1.5 mb-3 line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="flex items-center gap-1.5 text-gray-600 font-aptos-regular text-sm">
                            <FaMapMarkerAlt className="text-[#ff7010]" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1 text-[#ff7010] font-aptos-semibold text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                            Apply
                            <FaArrowRight className="text-xs" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center pt-10">
                <div className="flex items-center gap-2 text-gray-500 font-aptos-regular text-sm">
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#ff7010] animate-spin" />
                  Loading more openings...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
