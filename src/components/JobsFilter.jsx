import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import {
  FaMapMarkerAlt,
  FaClock,
  FaSearch,
  FaArrowRight,
  FaBuilding,
  FaChartLine,
  FaChartBar,
  FaBalanceScale,
  FaHandshake,
  FaUserTie,
  FaRocket,
  FaPenNib,
  FaHashtag,
  FaNewspaper,
  FaReact,
  FaServer,
  FaCogs,
} from 'react-icons/fa'
const JOB_LISTINGS_URL = 'https://job.dealstreetjournal.com/'

// Department-themed color panel — icon-only, no photography, for this grid.
const THEME_COLORS = {
  'Finance & Research': 'from-emerald-500 to-teal-700',
  'Sales & Growth': 'from-sky-500 to-indigo-700',
  Editorial: 'from-fuchsia-500 to-purple-700',
  Technology: 'from-[#ff7010] to-rose-700',
}
const DEFAULT_THEME = 'from-[#ff7010] to-orange-800'

const departments = ['All Departments', 'Finance & Research', 'Sales & Growth', 'Editorial', 'Technology']
const locations = ['All Locations', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Remote']
const jobTypes = ['All Types', 'Full Time', 'Internship', 'Contract']

const DEPARTMENTS_CONFIG = [
  {
    name: 'Finance & Research',
    titles: [
      { title: 'Senior Financial Analyst', icon: FaChartLine },
      { title: 'Data Research Analyst', icon: FaChartBar },
      { title: 'Equity Research Associate', icon: FaBalanceScale },
    ],
  },
  {
    name: 'Sales & Growth',
    titles: [
      { title: 'Business Development Executive', icon: FaHandshake },
      { title: 'Key Account Manager', icon: FaUserTie },
      { title: 'Growth Marketing Manager', icon: FaRocket },
    ],
  },
  {
    name: 'Editorial',
    titles: [
      { title: 'Content Writer — Startups & Finance', icon: FaPenNib },
      { title: 'Social Media Executive', icon: FaHashtag },
      { title: 'News Reporter', icon: FaNewspaper },
    ],
  },
  {
    name: 'Technology',
    titles: [
      { title: 'React Frontend Developer', icon: FaReact },
      { title: 'Backend Engineer (Node.js)', icon: FaServer },
      { title: 'DevOps Engineer', icon: FaCogs },
    ],
  },
]
const LOCATIONS_POOL = ['Mumbai, India', 'Delhi NCR, India', 'Bengaluru, India', 'Pune, India', 'Remote']
const TYPES_POOL = ['Full Time', 'Full Time', 'Full Time', 'Internship', 'Contract']
const BATCH_SIZE = 9

// 36 static placeholder openings (4 departments x 3 titles x 3 locations),
// generated per department then interleaved round-robin so the grid mixes
// departments together instead of showing one department's block at a time.
const openingsByDepartment = DEPARTMENTS_CONFIG.map((dept, deptIndex) =>
  dept.titles.flatMap(({ title, icon }, titleIndex) =>
    [0, 1, 2].map((slot) => {
      const seed = deptIndex * 9 + titleIndex * 3 + slot
      return {
        id: seed + 1,
        title,
        department: dept.name,
        location: LOCATIONS_POOL[(titleIndex + slot) % LOCATIONS_POOL.length],
        type: TYPES_POOL[seed % TYPES_POOL.length],
        icon,
      }
    })
  )
)

const openings = []
for (let row = 0; row < 9; row++) {
  for (const deptJobs of openingsByDepartment) {
    if (deptJobs[row]) openings.push(deptJobs[row])
  }
}

export default function JobsFilter() {
  const [department, setDepartment] = useState(departments[0])
  const [location, setLocation] = useState(locations[0])
  const [jobType, setJobType] = useState(jobTypes[0])
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 })

  const hasMore = visibleCount < openings.length

  // Reveals the next batch a little while after the sentinel scrolls into
  // view, so more openings keep loading in as the visitor scrolls down.
  useEffect(() => {
    if (!inView || !hasMore) return
    const timer = setTimeout(() => {
      setVisibleCount((count) => Math.min(count + BATCH_SIZE, openings.length))
    }, 350)
    return () => clearTimeout(timer)
  }, [inView, hasMore])

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

        {/* Openings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {openings.slice(0, visibleCount).map((job, index) => (
            <Reveal key={job.id} delay={(index % 3) * 100} className="h-full">
              <TiltCard
                as="a"
                href={JOB_LISTINGS_URL}
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
                    <job.icon className="absolute -bottom-3 -right-3 text-8xl text-white/10 rotate-12" />
                    <job.icon className="relative text-5xl text-white/90 transition-transform duration-300 group-hover:scale-110" />
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
      </div>
    </div>
  )
}
