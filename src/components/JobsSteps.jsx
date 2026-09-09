import { FaSearch, FaFileAlt, FaComments, FaCheckCircle } from 'react-icons/fa'

const steps = [
  {
    id: 1,
    icon: FaSearch,
    title: 'Browse Openings',
    description: 'Explore roles open across departments and locations.',
  },
  {
    id: 2,
    icon: FaFileAlt,
    title: 'Submit Application',
    description: 'Apply online with your resume in just a few clicks.',
  },
  {
    id: 3,
    icon: FaComments,
    title: 'Interview Rounds',
    description: 'Meet the team and walk us through your experience.',
  },
  {
    id: 4,
    icon: FaCheckCircle,
    title: 'Get Hired',
    description: 'Receive your offer and join the DSJ team.',
  },
]

const lifeAtDsj = [
  {
    id: 1,
    caption: 'Newsroom & Research',
    image: 'https://picsum.photos/seed/dsj-life-newsroom/500/400',
  },
  {
    id: 2,
    caption: 'Team Collaboration',
    image: 'https://picsum.photos/seed/dsj-life-team/500/400',
  },
  {
    id: 3,
    caption: 'Culture & Events',
    image: 'https://picsum.photos/seed/dsj-life-culture/500/400',
  },
]

export default function JobsSteps() {
  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-6xl w-[90%] mx-auto">
        <h2 className="text-2xl md:text-3xl font-aptos-semibold text-gray-900 text-center mb-2">
          How Hiring Works
        </h2>
        <p className="text-gray-600 font-aptos-regular text-center mb-12">
          A simple, four-step path from application to offer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 pt-10 text-center transition-all duration-300 hover:-translate-y-1"
              >
                <span className="absolute top-2 right-4 text-5xl font-aptos-bold text-orange-50 select-none">
                  {String(step.id).padStart(2, '0')}
                </span>
                <div className="relative z-10 w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#ff7010] to-[#c9550a] text-white flex items-center justify-center text-xl mb-5 shadow-md">
                  <Icon />
                </div>
                <h3 className="text-lg font-aptos-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 font-aptos-regular text-sm">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Life at DSJ image strip */}
        <div>
          <h3 className="text-xl md:text-2xl font-aptos-semibold text-gray-900 text-center mb-8">
            Life at DealStreetJournal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {lifeAtDsj.map((item) => (
              <div
                key={item.id}
                className="relative h-56 rounded-2xl overflow-hidden shadow-md group"
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-aptos-semibold">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
