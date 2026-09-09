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
} from 'react-icons/fa'

const JOB_LISTINGS_URL = 'https://job.dealstreetjournal.com/'

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
    image: 'https://picsum.photos/seed/dsj-job-finance/700/700',
  },
  {
    id: 2,
    title: 'Business Development Executive',
    department: 'Sales & Growth',
    location: 'Delhi NCR, India',
    type: 'Full Time',
    icon: FaBullhorn,
    image: 'https://picsum.photos/seed/dsj-job-sales/700/700',
  },
  {
    id: 3,
    title: 'Content Writer — Startups & Finance',
    department: 'Editorial',
    location: 'Remote',
    type: 'Full Time',
    icon: FaPenNib,
    image: 'https://picsum.photos/seed/dsj-job-editorial/700/700',
  },
  {
    id: 4,
    title: 'React Frontend Developer',
    department: 'Technology',
    location: 'Bengaluru, India',
    type: 'Full Time',
    icon: FaCode,
    image: 'https://picsum.photos/seed/dsj-job-tech/700/700',
  },
  {
    id: 5,
    title: 'Data Research Analyst',
    department: 'Finance & Research',
    location: 'Mumbai, India',
    type: 'Internship',
    icon: FaChartLine,
    image: 'https://picsum.photos/seed/dsj-job-data/700/700',
  },
  {
    id: 6,
    title: 'Social Media Executive',
    department: 'Editorial',
    location: 'Remote',
    type: 'Contract',
    icon: FaPenNib,
    image: 'https://picsum.photos/seed/dsj-job-social/700/700',
  },
  {
    id: 7,
    title: 'Key Account Manager',
    department: 'Sales & Growth',
    location: 'Pune, India',
    type: 'Full Time',
    icon: FaBullhorn,
    image: 'https://picsum.photos/seed/dsj-job-accounts/700/700',
  },
  {
    id: 8,
    title: 'Backend Engineer (Node.js)',
    department: 'Technology',
    location: 'Bengaluru, India',
    type: 'Full Time',
    icon: FaCode,
    image: 'https://picsum.photos/seed/dsj-job-backend/700/700',
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
      {/* Hero banner */}
      <div
        className="relative w-full h-[360px] sm:h-[400px] bg-cover bg-center flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(15,12,10,0.9) 15%, rgba(255,112,16,0.45) 100%), url('https://picsum.photos/seed/dsj-jobs-hero/1600/900')`,
        }}
      >
        <div className="relative z-10 max-w-6xl w-[90%] mx-auto">
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white font-aptos-semibold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            We're Hiring
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-aptos-bold text-white max-w-2xl leading-tight mb-4">
            Build Your Career With DealStreetJournal
          </h1>
          <p className="text-white/85 font-aptos-regular text-base sm:text-lg max-w-xl mb-7">
            Join a team covering the startups, deals and money shaping the
            world — and help build the products that bring that story to
            readers.
          </p>
          <a
            href={JOB_LISTINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#ff7010] hover:bg-orange-600 text-white font-aptos-semibold px-6 py-3 rounded-md transition-colors"
          >
            Browse All Openings
            <FaArrowRight />
          </a>
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
                  <img
                    src={job.image}
                    alt={job.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ filter: `brightness(${0.5 + depth * 0.5}) blur(${(1 - depth) * 1.5}px)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                  <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#ff7010] text-white flex items-center justify-center shadow-md">
                    <Icon className="text-xs" />
                  </span>

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
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <MdOutlineKeyboardArrowLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next job"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                className={`h-1.5 rounded-full transition-all ${
                  depth > 0.95
                    ? 'bg-[#ff7010] w-6'
                    : 'bg-white/25 w-1.5 hover:bg-white/40'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
