import { useInView } from 'react-intersection-observer'
import {
  FaUserPlus,
  FaCompass,
  FaPaperPlane,
  FaBullseye,
  FaAward,
  FaRocket,
  FaBolt,
  FaFlag,
  FaCoins,
} from 'react-icons/fa'
import Reveal from './Reveal'
import TiltCard from './TiltCard'

const steps = [
  {
    id: 1,
    icon: FaUserPlus,
    title: 'Create Your Profile',
    description: 'Build your profile — skills, experience, and what you want to work on next.',
  },
  {
    id: 2,
    icon: FaCompass,
    title: 'Discover Startups',
    description: "Browse startups, check their growth stage, and understand the company's product before you apply.",
  },
  {
    id: 3,
    icon: FaPaperPlane,
    title: 'Apply',
    description: 'Easy Apply to roles that actually fit your skills — no long forms, no guesswork.',
  },
  {
    id: 4,
    icon: FaBullseye,
    title: 'Best Match',
    description: 'Our matching surfaces roles that fit you best and puts your profile in front of the right employers.',
  },
  {
    id: 5,
    icon: FaAward,
    title: 'Get Hired',
    description: 'Get selected for interviews, showcase your skills, and unlock the best opportunities to start building your career.',
  },
]

const whyStartups = [
  {
    id: 1,
    icon: FaRocket,
    title: 'Faster Growth',
    description: 'Learn 10x faster and grow your career at rocket speed — startups compress years of learning into months.',
  },
  {
    id: 2,
    icon: FaBolt,
    title: 'Real Impact',
    description: 'Your work directly impacts millions of users.',
  },
  {
    id: 3,
    icon: FaFlag,
    title: 'Ownership',
    description: 'Take ownership, build products, see results end to end.',
  },
  {
    id: 4,
    icon: FaCoins,
    title: 'Wealth Creation',
    description: 'ESOPs and value creation like never before — build equity, not just a salary.',
  },
]

export default function JobsSteps() {
  const { ref: railRef, inView: railInView } = useInView({ triggerOnce: true, threshold: 0.4 })

  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-6xl w-[90%] mx-auto">
        <h2 className="text-2xl md:text-3xl font-aptos-semibold text-gray-900 text-center mb-2">
          How Hiring Works
        </h2>
        <p className="text-gray-600 font-aptos-regular text-center mb-12">
          Go from sign-up to your first offer in five simple steps.
        </p>

        <div ref={railRef} className="relative mb-16">
          {/* Connecting rail threading step to step — sits behind the cards
              (only visible in the gaps between them) and fills left-to-right
              once the section scrolls into view, so it reads as "this step
              leads to this step" rather than five unrelated cards. */}
          <div className="hidden lg:block absolute top-[68px] left-[10%] right-[10%] h-0.5 bg-gray-200 z-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff7010] to-orange-300 origin-left transition-transform duration-[1600ms] ease-out"
              style={{ transform: `scaleX(${railInView ? 1 : 0})` }}
            />
            {/* Traveling light — keeps looping along the rail once filled, so
                the sequence keeps visibly moving instead of settling still. */}
            {railInView && (
              <span
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#ff7010] shadow-[0_0_8px_3px_rgba(255,112,16,0.6)]"
                style={{ animation: 'travelRight 3s linear 1.6s infinite' }}
              />
            )}
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Reveal key={step.id} delay={index * 120} className="h-full">
                  <div className="group relative h-full rounded-2xl p-[2px]">
                    {/* Flowing gradient border — invisible at rest, sweeps
                        across the edge on hover instead of the card popping
                        a static highlight. */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #ff7010, #ffd08a, #ff7010, #ffd08a, #ff7010)',
                        backgroundSize: '300% 100%',
                        animation: 'borderFlow 2.5s linear infinite',
                      }}
                    />
                    <div className="relative bg-white rounded-[14px] shadow-md group-hover:shadow-xl border border-gray-100 h-full p-6 pt-10 text-center transition-all duration-300 group-hover:-translate-y-1">
                      <span className="absolute top-2 right-4 text-5xl font-aptos-bold text-orange-50 select-none">
                        {String(step.id).padStart(2, '0')}
                      </span>
                      <div className="relative w-14 h-14 mx-auto mb-5">
                        {/* Ongoing pulse ring, staggered per step, so the row
                            of icons stays quietly "alive" even at rest. */}
                        <span
                          className="absolute inset-0 rounded-full bg-[#ff7010] opacity-75 animate-ping"
                          style={{ animationDelay: `${index * 0.4}s`, animationDuration: '2.4s' }}
                        />
                        <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff7010] to-[#c9550a] text-white flex items-center justify-center text-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                          <Icon />
                        </div>
                      </div>
                      <h3 className="text-lg font-aptos-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 font-aptos-regular text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Why build at startups */}
        <div>
          <h3 className="text-xl md:text-2xl font-aptos-semibold text-gray-900 text-center mb-8">
            Why Build at Startups?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyStartups.map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal key={item.id} delay={index * 120} className="h-full">
                  <TiltCard maxTilt={6} className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 text-center h-full">
                    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#ff7010] to-[#c9550a] text-white flex items-center justify-center text-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                      <Icon />
                    </div>
                    <h4 className="text-lg font-aptos-semibold text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 font-aptos-regular text-sm">
                      {item.description}
                    </p>
                  </TiltCard>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
