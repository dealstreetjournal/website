import { useEffect, useRef, useState } from 'react'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import {
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaChartLine,
  FaBullhorn,
  FaPenNib,
  FaCode,
  FaLaptopCode,
  FaPalette,
  FaChartPie,
  FaUsersCog,
  FaCogs,
  FaBriefcaseMedical,
  FaGraduationCap,
} from 'react-icons/fa'
import jobsHeroIllustration from '../assets/jobsHeroIllustration.png'
import Reveal from './Reveal'
import Counter from './Counter'
import MagneticButton from './MagneticButton'

const STATS = [
  { id: 1, value: 500, suffix: '+', label: 'Open Roles' },
  { id: 2, value: 50, suffix: '+', label: 'Startups Hiring' },
  { id: 3, value: 1000, suffix: '+', label: 'Builders Placed' },
  { id: 4, value: 10, suffix: '+', label: 'Cities' },
]

const CATEGORIES = [
  { name: 'IT & Software', icon: FaLaptopCode },
  { name: 'Design & Creative', icon: FaPalette },
  { name: 'Marketing & Sales', icon: FaBullhorn },
  { name: 'Finance', icon: FaChartPie },
  { name: 'HR & Management', icon: FaUsersCog },
  { name: 'Engineering', icon: FaCogs },
  { name: 'Healthcare', icon: FaBriefcaseMedical },
  { name: 'Education', icon: FaGraduationCap },
]

const JOB_LISTINGS_URL = 'https://job.dealstreetjournal.com/'

// Department-themed gradient panel — same treatment as the "Find Your Role"
// grid below, so a role's card always reads as relevant to its own field
// instead of a random stock photo standing in for it.
const THEME_COLORS = {
  'Finance & Research': 'from-emerald-500 to-teal-700',
  'Sales & Growth': 'from-sky-500 to-indigo-700',
  Editorial: 'from-fuchsia-500 to-purple-700',
  Technology: 'from-[#ff7010] to-rose-700',
}
const DEFAULT_THEME = 'from-[#ff7010] to-orange-800'

// How long a poster glides to the next slot, and how long it then holds at
// the front before moving on again — a "slide, pause, slide" reel rhythm
// rather than either an instant jump or a rotation that never settles.
const SLIDE_DURATION_MS = 900
const HOLD_DURATION_MS = 2600

// Static placeholder openings until the jobs page is wired up to a real feed.
const featuredJobs = [
  {
    id: 1,
    title: 'Senior Financial Analyst',
    department: 'Finance & Research',
    location: 'Mumbai, India',
    type: 'Full Time',
    icon: FaChartLine,
  },
  {
    id: 2,
    title: 'Business Development Executive',
    department: 'Sales & Growth',
    location: 'Delhi NCR, India',
    type: 'Full Time',
    icon: FaBullhorn,
  },
  {
    id: 3,
    title: 'Content Writer — Startups & Finance',
    department: 'Editorial',
    location: 'Remote',
    type: 'Full Time',
    icon: FaPenNib,
  },
  {
    id: 4,
    title: 'React Frontend Developer',
    department: 'Technology',
    location: 'Bengaluru, India',
    type: 'Full Time',
    icon: FaCode,
  },
  {
    id: 5,
    title: 'Data Research Analyst',
    department: 'Finance & Research',
    location: 'Mumbai, India',
    type: 'Internship',
    icon: FaChartLine,
  },
  {
    id: 6,
    title: 'Social Media Executive',
    department: 'Editorial',
    location: 'Remote',
    type: 'Contract',
    icon: FaPenNib,
  },
  {
    id: 7,
    title: 'Key Account Manager',
    department: 'Sales & Growth',
    location: 'Pune, India',
    type: 'Full Time',
    icon: FaBullhorn,
  },
  {
    id: 8,
    title: 'Backend Engineer (Node.js)',
    department: 'Technology',
    location: 'Bengaluru, India',
    type: 'Full Time',
    icon: FaCode,
  },
]

// Normalizes any angle to (-180, 180] so we can measure how close a poster
// currently is to the front of the reel, regardless of how many laps the
// continuous rotation counter has made.
const normalizeAngle = (deg) => {
  let a = deg % 360
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  return a
}

// Eases the glide between two slots so it isn't a linear, mechanical move.
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2)

export default function JobsSlider() {
  const slides = featuredJobs
  const anglePerCard = 360 / slides.length
  const [isPaused, setIsPaused] = useState(false)
  const [angle, setAngle] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const angleRef = useRef(0)
  const isPausedRef = useRef(false)
  const rafRef = useRef(null)
  const lastFrameRef = useRef(null)
  const phaseRef = useRef('hold') // 'hold' | 'slide'
  const phaseElapsedRef = useRef(0)
  const fromAngleRef = useRef(0)
  const toAngleRef = useRef(anglePerCard)

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Drives a subtle parallax on the hero's ambient orbs — they drift at a
  // different rate than the page itself, so scrolling reads as having depth
  // instead of the background just sliding along 1:1 with everything else.
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const startSlideTo = (targetAngle) => {
    fromAngleRef.current = angleRef.current
    toAngleRef.current = targetAngle
    phaseRef.current = 'slide'
    phaseElapsedRef.current = 0
  }

  useEffect(() => {
    const tick = (timestamp) => {
      if (lastFrameRef.current == null) lastFrameRef.current = timestamp
      const delta = timestamp - lastFrameRef.current
      lastFrameRef.current = timestamp

      if (!isPausedRef.current) {
        phaseElapsedRef.current += delta

        if (phaseRef.current === 'hold') {
          if (phaseElapsedRef.current >= HOLD_DURATION_MS) {
            startSlideTo(angleRef.current + anglePerCard)
          }
        } else {
          const t = Math.min(phaseElapsedRef.current / SLIDE_DURATION_MS, 1)
          const eased = easeInOutQuad(t)
          angleRef.current =
            fromAngleRef.current + (toAngleRef.current - fromAngleRef.current) * eased
          setAngle(angleRef.current)
          if (t >= 1) {
            phaseRef.current = 'hold'
            phaseElapsedRef.current = 0
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [anglePerCard])

  const goToSlide = (index) => {
    const current = normalizeAngle(index * anglePerCard - angleRef.current)
    startSlideTo(angleRef.current + current)
  }

  const nextSlide = () => startSlideTo(angleRef.current + anglePerCard)
  const prevSlide = () => startSlideTo(angleRef.current - anglePerCard)

  const handleCardClick = (index, depth) => {
    if (depth > 0.95) {
      window.open(JOB_LISTINGS_URL, '_blank', 'noopener,noreferrer')
    } else {
      goToSlide(index)
    }
  }

  return (
    <div className="w-full">
      {/* Hero banner — white background, content on the left, a polished
          built graphic (blurred backdrop glow + gradient blob + floating
          icon badges) on the right, same palette as the brand reference
          recreated with CSS/icons rather than embedding it as an image */}
      <div className="relative w-full bg-white py-3 sm:py-4 overflow-hidden">
        {/* Slow-drifting ambient orbs — always in motion, so the hero never
            reads as a static, unchanging screen even before anyone scrolls.
            The whole group also parallaxes at a fraction of scroll speed,
            so scrolling reads as having depth, not just sliding by. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="absolute top-10 left-[5%] w-40 h-40 rounded-full bg-purple-200/40 blur-3xl animate-[drift_9s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-[8%] w-56 h-56 rounded-full bg-orange-200/40 blur-3xl animate-[driftReverse_11s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-[25%] w-24 h-24 rounded-full bg-pink-200/40 blur-2xl animate-[drift_7s_ease-in-out_infinite]" />
        </div>

        <div className="relative max-w-6xl w-[90%] mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left — content, cascading in line by line rather than all at
              once, so the page load itself feels choreographed. */}
          <div className="text-center md:text-left">
            <Reveal y={14} duration={550}>
              <span className="inline-flex items-center gap-2 bg-orange-50 text-[#ff7010] font-aptos-semibold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7010]" />
                DealStreetJournal Careers
              </span>
            </Reveal>
            <Reveal delay={120} y={18} duration={600}>
              <h1 className="text-4xl sm:text-5xl font-aptos-bold text-gray-900 leading-tight mb-5">
                Don&apos;t just find a job.
                <br />
                Build{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-[#ff7010] bg-clip-text text-transparent">
                  the future.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={260} y={18} duration={600}>
              <p className="text-gray-600 font-aptos-regular text-base sm:text-lg max-w-md mx-auto md:mx-0 mb-8">
                Discover funded startups. Understand their growth. Meet the
                founders. Choose where you&apos;ll build what matters.
              </p>
            </Reveal>
            <Reveal delay={400} y={14} duration={600}>
              <MagneticButton
                href={JOB_LISTINGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ff7010] hover:bg-orange-600 text-white font-aptos-semibold px-6 py-3 rounded-md hover:shadow-lg animate-[glowBorder_2.2s_ease-in-out_infinite]"
              >
                Browse All Openings
                <FaArrowRight />
              </MagneticButton>
            </Reveal>
          </div>

          {/* Right — illustration, popping in with a bit of scale + rotate
              instead of a plain fade, then settling into its own float loop. */}
          <Reveal delay={200} y={10} scale={0.85} rotate={-4} duration={750} className="flex items-center justify-center">
            <img
              src={jobsHeroIllustration}
              alt="Careers at DealStreetJournal"
              className="w-full max-w-[340px] sm:max-w-md animate-[float_4s_ease-in-out_infinite]"
            />
          </Reveal>
        </div>

        {/* Stats — count up once in view, a small "look what this platform
            already is" payoff right under the fold. */}
        <div className="relative max-w-6xl w-[90%] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 sm:mt-14 pt-8 border-t border-gray-100">
          {STATS.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 100} y={14}>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-aptos-bold text-gray-900">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 font-aptos-regular text-xs sm:text-sm mt-1">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Category marquee — a continuously auto-scrolling strip, the kind
            of always-moving banner most modern landing pages run somewhere. */}
        <div className="relative mt-10 sm:mt-14 py-4 border-t border-gray-100 overflow-hidden marquee-container">
          <div className="flex w-max marquee-content-fast">
            {[0, 1, 2].map((copy) => (
              <div key={copy} className="flex items-center gap-3 pr-3">
                {CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon
                  return (
                    <span
                      key={`${copy}-${cat.name}`}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-sm font-aptos-semibold text-gray-700 whitespace-nowrap mr-3"
                    >
                      <CatIcon className="text-[#ff7010]" />
                      {cat.name}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured openings — a film-reel drum: glide to the next frame, hold
          it at the gate for a moment, then move on again */}
      <div className="relative w-full bg-[#0e0b0a] py-10 overflow-hidden">
        {/* Ambient spotlight glow behind the front-facing poster */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#ff7010]/10 blur-[120px] rounded-full" />

        <div className="relative max-w-6xl w-[90%] mx-auto text-center mb-6">
          <span className="text-[#ff7010] font-aptos-semibold uppercase tracking-widest text-xs">
            Now Hiring
          </span>
          <h2 className="text-2xl sm:text-3xl font-aptos-semibold text-white mt-2">
            Featured Openings
          </h2>
        </div>

        <div
          className="relative h-[220px] sm:h-[280px] md:h-[330px] lg:h-[360px]"
          style={{ perspective: '1600px' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {slides.map((job, index) => {
            // Every poster keeps a fixed slot on the drum; only the shared
            // `angle` moves, so nothing ever teleports in — it just keeps
            // arriving from behind and swinging round to the front, close
            // enough to its neighbours either side that they touch.
            const rawAngle = index * anglePerCard - angle
            const rad = (rawAngle * Math.PI) / 180
            const depth = (Math.cos(rad) + 1) / 2 // 1 = front-facing, 0 = directly behind
            const scale = 0.6 + depth * 0.4
            const opacity = Math.max(depth - 0.03, 0)
            const zIndex = Math.round(depth * 100)
            // In viewport-width units (not the card's own width) so the row
            // spreads across the full section instead of staying clustered
            // in the middle on wide screens, while the cards' own width is
            // also viewport-relative (see cardSize below) so neighbouring
            // cards stay touching instead of drifting apart on big screens.
            const translateXVw = Math.sin(rad) * 34
            const translateZ = (Math.cos(rad) - 1) * 200
            // `angle` keeps climbing forever (it never wraps), so it has to
            // be normalized before driving rotateY — otherwise the tilt
            // keeps winding past 90°, and without a matching rotation the
            // poster starts showing its own mirrored backside as it spins.
            const rotateY = -normalizeAngle(rawAngle) * 0.3
            const infoOpacity = Math.max(0, Math.min(1, (depth - 0.92) / 0.08))
            const Icon = job.icon

            return (
              <div
                key={job.id}
                role="button"
                tabIndex={0}
                aria-label={depth > 0.95 ? `Apply — ${job.title}` : `Show ${job.title}`}
                onClick={() => handleCardClick(index, depth)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCardClick(index, depth)
                  }
                }}
                className="absolute left-1/2 top-1/2 cursor-pointer"
                style={{
                  width: 'clamp(190px, 26vw, 340px)',
                  height: 'clamp(190px, 26vw, 340px)',
                  transform: `translate(-50%, -50%) translateX(${translateXVw}vw) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: opacity > 0.15 ? 'auto' : 'none',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${THEME_COLORS[job.department] || DEFAULT_THEME} flex items-center justify-center`}
                    style={{ filter: `brightness(${0.65 + depth * 0.35})` }}
                  >
                    <Icon className="text-white/90" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <span className="text-[#ff9a4d] font-aptos-semibold uppercase tracking-wide text-[10px]">
                      {job.department}
                    </span>
                    <h3 className="text-white font-aptos-semibold text-base sm:text-lg mt-1 mb-2 leading-snug">
                      {job.title}
                    </h3>

                    <div style={{ opacity: infoOpacity }}>
                      <div className="flex flex-wrap gap-3 text-white/80 font-aptos-regular text-xs mb-3">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-[#ff7010]" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[#ff7010]" />
                          {job.type}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 bg-[#ff7010] text-white font-aptos-semibold text-xs px-3 py-1.5 rounded-full">
                        Apply Now
                        <FaArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="relative flex gap-4 justify-center mt-5 mb-4">
          <button
            onClick={prevSlide}
            aria-label="Previous job"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-[#ff7010] hover:border-[#ff7010] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <MdOutlineKeyboardArrowLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next job"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-[#ff7010] hover:border-[#ff7010] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <MdOutlineKeyboardArrowRight size={22} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="relative flex flex-wrap justify-center gap-2 px-6">
          {slides.map((_, index) => {
            const depth = (Math.cos(((index * anglePerCard - angle) * Math.PI) / 180) + 1) / 2
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Bring ${slides[index].title} to the front`}
                className={`h-1.5 rounded-full transition-all duration-200 hover:scale-125 ${
                  depth > 0.95
                    ? 'bg-[#ff7010] w-6'
                    : 'bg-white/25 w-1.5 hover:bg-white/50'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
