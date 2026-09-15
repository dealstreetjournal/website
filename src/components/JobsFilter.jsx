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

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const JOB_LISTINGS_URL =
  'https://job.dealstreetjournal.com/'

const ALL_DEPARTMENTS = 'All Departments'
const ALL_LOCATIONS = 'All Locations'
const ALL_TYPES = 'All Types'

const BATCH_SIZE = 9

// -----------------------------------------------------------------------------
// Department Themes
// -----------------------------------------------------------------------------

const THEME_COLORS = {
  'Finance & Research':
    'from-emerald-500 to-teal-700',

  'Sales & Growth':
    'from-sky-500 to-indigo-700',

  Editorial:
    'from-fuchsia-500 to-purple-700',

  Technology:
    'from-[#ff7010] to-rose-700',

  'Hardware Engineer':
    'from-[#ff7010] to-rose-700',
}

const DEFAULT_THEME =
  'from-[#ff7010] to-orange-800'

// -----------------------------------------------------------------------------
// Helper: Pick first available value
// -----------------------------------------------------------------------------

const pick = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key]

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value
    }
  }

  return undefined
}

// -----------------------------------------------------------------------------
// Format Job Type
// -----------------------------------------------------------------------------

const formatJobType = (type) => {
  const typeMap = {
    FULLTIME: 'Full Time',
    PARTTIME: 'Part Time',
    INTERNSHIP: 'Internship',
    CONTRACT: 'Contract',
    FREELANCE: 'Freelance',
    TEMPORARY: 'Temporary',
  }

  return (
    typeMap[type] ||
    type ||
    'Full Time'
  )
}

// -----------------------------------------------------------------------------
// Normalize API Job
// -----------------------------------------------------------------------------

const normalizeJob = (raw, index) => {
  const city = pick(raw, 'city')
  const state = pick(raw, 'state')

  const location =
    [city, state]
      .filter(Boolean)
      .join(', ') || 'Not specified'

  return {
    // ID
    id:
      pick(
        raw,
        'id',
        '_id',
        'slug',
        'jobId'
      ) ?? `job-${index}`,

    // Job title
    title:
      pick(
        raw,
        'jobTitle',
        'title',
        'name',
        'position'
      ) || 'Open Position',

    // Use subCategory first because it is more meaningful.
    //
    // Example:
    // jobCategory: OTHER
    // subCategory: Hardware Engineer
    //
    // UI will show:
    // Hardware Engineer
    department:
      pick(
        raw,
        'subCategory',
        'jobCategory',
        'department',
        'category',
        'team',
        'function'
      ) || 'General',

    // Location
    location,

    // Job type
    type: formatJobType(
      pick(
        raw,
        'jobType',
        'type',
        'employmentType',
        'employmentMode'
      )
    ),

    // Experience
    experience:
      pick(
        raw,
        'Experience',
        'experience',
        'experienceRequired'
      ) || 'Not specified',

    // Salary
    salary:
      pick(
        raw,
        'salary',
        'ctc',
        'package'
      ) || 'Not specified',

    // Skills
    skills: Array.isArray(raw?.skills)
      ? raw.skills
      : [],

    // Posted date
    postAt:
      pick(
        raw,
        'postAt',
        'postedAt',
        'createdAt'
      ) || null,

    // Direct job URL if API ever provides one.
    // Current API response does not contain one,
    // so fallback to the main job board.
    url:
      pick(
        raw,
        'url',
        'applyUrl',
        'applicationUrl',
        'link',
        'jobUrl',
        'postingUrl'
      ) || JOB_LISTINGS_URL,
  }
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function JobsFilter() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [jobs, setJobs] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [loadFailed, setLoadFailed] =
    useState(false)

  const [department, setDepartment] =
    useState(ALL_DEPARTMENTS)

  const [location, setLocation] =
    useState(ALL_LOCATIONS)

  const [jobType, setJobType] =
    useState(ALL_TYPES)

  const [visibleCount, setVisibleCount] =
    useState(BATCH_SIZE)

  // ---------------------------------------------------------------------------
  // Infinite Scroll
  // ---------------------------------------------------------------------------

  const {
    ref: sentinelRef,
    inView,
  } = useInView({
    threshold: 0,
  })

  // ---------------------------------------------------------------------------
  // Fetch Jobs Directly From API
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false

    const loadJobs = async () => {
      try {
        setLoading(true)
        setLoadFailed(false)

        const data = await getJobs()

        if (cancelled) {
          return
        }

        const normalizedJobs =
          Array.isArray(data)
            ? data.map(normalizeJob)
            : []

        setJobs(normalizedJobs)
      } catch (error) {
        console.error(
          'Failed to load jobs:',
          error
        )

        if (!cancelled) {
          setLoadFailed(true)
          setJobs([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadJobs()

    return () => {
      cancelled = true
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Department Filter Options
  // ---------------------------------------------------------------------------

  const departments = useMemo(() => {
    const values = jobs
      .map((job) => job.department)
      .filter(Boolean)

    return [
      ALL_DEPARTMENTS,
      ...Array.from(
        new Set(values)
      ),
    ]
  }, [jobs])

  // ---------------------------------------------------------------------------
  // Location Filter Options
  // ---------------------------------------------------------------------------

  const locations = useMemo(() => {
    const values = jobs
      .map((job) => job.location)
      .filter(Boolean)

    return [
      ALL_LOCATIONS,
      ...Array.from(
        new Set(values)
      ),
    ]
  }, [jobs])

  // ---------------------------------------------------------------------------
  // Job Type Filter Options
  // ---------------------------------------------------------------------------

  const jobTypes = useMemo(() => {
    const values = jobs
      .map((job) => job.type)
      .filter(Boolean)

    return [
      ALL_TYPES,
      ...Array.from(
        new Set(values)
      ),
    ]
  }, [jobs])

  // ---------------------------------------------------------------------------
  // Filter Jobs
  // ---------------------------------------------------------------------------

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const departmentMatch =
        department === ALL_DEPARTMENTS ||
        job.department === department

      const locationMatch =
        location === ALL_LOCATIONS ||
        job.location === location

      const typeMatch =
        jobType === ALL_TYPES ||
        job.type === jobType

      return (
        departmentMatch &&
        locationMatch &&
        typeMatch
      )
    })
  }, [
    jobs,
    department,
    location,
    jobType,
  ])

  // ---------------------------------------------------------------------------
  // Reset Visible Count When Filters Change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [
    department,
    location,
    jobType,
    jobs,
  ])

  // ---------------------------------------------------------------------------
  // Check More Jobs
  // ---------------------------------------------------------------------------

  const hasMore =
    visibleCount <
    filteredJobs.length

  // ---------------------------------------------------------------------------
  // Infinite Loading
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!inView || !hasMore) {
      return
    }

    const timer = setTimeout(() => {
      setVisibleCount((currentCount) =>
        Math.min(
          currentCount + BATCH_SIZE,
          filteredJobs.length
        )
      )
    }, 350)

    return () => {
      clearTimeout(timer)
    }
  }, [
    inView,
    hasMore,
    filteredJobs.length,
  ])

  // ---------------------------------------------------------------------------
  // Open Job Board
  // ---------------------------------------------------------------------------

  const goToListings = () => {
    window.open(
      JOB_LISTINGS_URL,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full bg-[#F8F9FA] py-16">
      <div className="max-w-6xl w-[90%] mx-auto">

        {/* ----------------------------------------------------------------- */}
        {/* Heading */}
        {/* ----------------------------------------------------------------- */}

        <h2 className="text-2xl md:text-3xl font-aptos-semibold text-gray-900 text-center mb-2">
          Find Your Role
        </h2>

        <p className="text-gray-600 font-aptos-regular text-center mb-8">
          Filter openings by department, location or job type.
        </p>

        {/* ----------------------------------------------------------------- */}
        {/* Filter Bar */}
        {/* ----------------------------------------------------------------- */}

        <div className="bg-white rounded-2xl shadow-md p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-12">

          {/* Department */}
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">

            <FaBuilding className="text-[#ff7010] shrink-0" />

            <select
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {departments.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Location */}
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">

            <FaMapMarkerAlt className="text-[#ff7010] shrink-0" />

            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {locations.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Job Type */}
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#ff7010] focus-within:ring-2 focus-within:ring-orange-100 hover:border-orange-200 transition-all">

            <FaClock className="text-[#ff7010] shrink-0" />

            <select
              value={jobType}
              onChange={(e) =>
                setJobType(
                  e.target.value
                )
              }
              className="w-full bg-transparent py-2.5 font-aptos-regular text-sm text-gray-700 focus:outline-none"
            >
              {jobTypes.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={goToListings}
            className="flex items-center justify-center gap-2 bg-[#ff7010] hover:bg-orange-600 text-white font-aptos-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <FaSearch />

            Search Jobs
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Loading */}
        {/* ----------------------------------------------------------------- */}

        {loading ? (
          <div className="flex justify-center py-16">

            <div className="flex items-center gap-2 text-gray-500 font-aptos-regular text-sm">

              <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#ff7010] animate-spin" />

              Loading openings...

            </div>
          </div>

        ) : filteredJobs.length === 0 ? (

          /* --------------------------------------------------------------- */
          /* No Jobs */
          /* --------------------------------------------------------------- */

          <div className="flex flex-col items-center gap-3 py-16 text-center">

            <FaBriefcase className="text-4xl text-gray-300" />

            <p className="text-gray-600 font-aptos-semibold">
              {loadFailed ||
              jobs.length === 0
                ? 'No open positions right now — check back soon!'
                : 'No openings match these filters — try broadening your search.'}
            </p>

            <button
              type="button"
              onClick={goToListings}
              className="text-[#ff7010] font-aptos-semibold text-sm hover:underline"
            >
              View the full job board →
            </button>

          </div>

        ) : (

          /* --------------------------------------------------------------- */
          /* Jobs Grid */
          /* --------------------------------------------------------------- */

          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

              {filteredJobs
                .slice(
                  0,
                  visibleCount
                )
                .map(
                  (job, index) => (

                    <Reveal
                      key={job.id}
                      delay={
                        (index % 3) * 100
                      }
                      className="h-full"
                    >

                      <TiltCard
                        as="a"
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        maxTilt={5}
                        className="group relative block h-full rounded-2xl p-[2px]"
                      >

                        {/* ------------------------------------------------ */}
                        {/* Animated Border */}
                        {/* ------------------------------------------------ */}

                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            backgroundImage:
                              'linear-gradient(90deg, #ff7010, #ffd08a, #ff7010, #ffd08a, #ff7010)',
                            backgroundSize:
                              '300% 100%',
                            animation:
                              'borderFlow 2.5s linear infinite',
                          }}
                        />

                        {/* ------------------------------------------------ */}
                        {/* Card */}
                        {/* ------------------------------------------------ */}

                        <div className="relative bg-white rounded-[14px] shadow-md group-hover:shadow-xl overflow-hidden transition-shadow duration-300 h-full flex flex-col">

                          {/* ---------------------------------------------- */}
                          {/* Card Header */}
                          {/* ---------------------------------------------- */}

                          <div
                            className={`h-40 w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${
                              THEME_COLORS[
                                job.department
                              ] ||
                              DEFAULT_THEME
                            }`}
                          >

                            {/* Background Icon */}
                            <FaBriefcase className="absolute -bottom-3 -right-3 text-8xl text-white/10 rotate-12" />

                            {/* Main Icon */}
                            <FaBriefcase className="relative text-5xl text-white/90 transition-transform duration-300 group-hover:scale-110" />

                            {/* Job Type */}
                            <span className="absolute top-3 left-3 bg-white/95 text-[#ff7010] font-aptos-semibold text-xs px-3 py-1 rounded-full shadow transition-transform duration-300 group-hover:scale-105">
                              {job.type}
                            </span>

                          </div>

                          {/* ---------------------------------------------- */}
                          {/* Card Content */}
                          {/* ---------------------------------------------- */}

                          <div className="p-5 flex flex-col flex-1">

                            {/* Department */}
                            <span className="font-aptos-semibold uppercase tracking-wide text-xs text-[#ff7010]">
                              {job.department}
                            </span>

                            {/* Job Title */}
                            <h3 className="font-aptos-semibold text-gray-900 mt-1.5 mb-3 line-clamp-2">
                              {job.title}
                            </h3>

                            {/* Experience */}
                            {job.experience !==
                              'Not specified' && (
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-aptos-semibold">
                                  Experience:
                                </span>{' '}
                                {job.experience}
                              </div>
                            )}

                            {/* Salary */}
                            {job.salary !==
                              'Not specified' && (
                              <div className="text-xs text-gray-500 mb-3">
                                <span className="font-aptos-semibold">
                                  Salary:
                                </span>{' '}
                                {job.salary}
                              </div>
                            )}

                            {/* ------------------------------------------ */}
                            {/* Bottom Row */}
                            {/* ------------------------------------------ */}

                            <div className="flex items-center justify-between mt-auto gap-3">

                              {/* Location */}
                              <span className="flex items-center gap-1.5 text-gray-600 font-aptos-regular text-sm min-w-0">

                                <FaMapMarkerAlt className="text-[#ff7010] shrink-0" />

                                <span className="truncate">
                                  {job.location}
                                </span>

                              </span>

                              {/* Apply */}
                              <span className="flex items-center gap-1 text-[#ff7010] font-aptos-semibold text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">

                                Apply

                                <FaArrowRight className="text-xs" />

                              </span>

                            </div>

                          </div>
                        </div>

                      </TiltCard>

                    </Reveal>
                  )
                )}

            </div>

            {/* ------------------------------------------------------------- */}
            {/* Infinite Scroll Loading */}
            {/* ------------------------------------------------------------- */}

            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex justify-center pt-10"
              >

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