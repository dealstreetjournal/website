import React from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineNewspaper,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentMagnifyingGlass,
  HiArrowRight,
  HiOutlineRocketLaunch,
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

// Headings use the site-wide Aptos face (declared in index.css).
const HEADING = { fontFamily: "'Aptos', sans-serif" }
const NAVY = 'text-[#0f1b3d]'
const ORANGE = '#ff7010'

const COLORS = {
  pink: '#e8336f',
  orange: '#f2760a',
  violet: '#6d28d9',
  blue: '#1d6fe0',
}

const Eyebrow = ({ children, className = 'text-[#ff7010]' }) => (
  <p className={`font-aptos-semibold text-xs tracking-[0.25em] uppercase mb-3 ${className}`}>
    {children}
  </p>
)

const LAYERS = {
  news: {
    title: 'News',
    question: 'What happened?',
    text: 'Fundraising across stages, M&A, IPOs and key company developments.',
    tags: ['Pre-seed', 'Seed', 'Growth', 'M&A', 'IPO'],
    icon: HiOutlineNewspaper,
    color: COLORS.pink,
    card: 'bg-pink-50',
  },
  data: {
    title: 'Data',
    question: 'What are the numbers?',
    text: 'Deals, valuations, investors, cap tables and market trends.',
    tags: ['Deals', 'Valuations', 'Investors', 'Cap tables'],
    icon: HiOutlineChartBar,
    color: COLORS.orange,
    card: 'bg-orange-50',
  },
  analysis: {
    title: 'Analysis',
    question: 'Why does it matter?',
    text: 'Financials, margins, ratios and in-depth company intelligence.',
    tags: ['Financials', 'Margins', 'Ratios'],
    icon: HiOutlineDocumentMagnifyingGlass,
    color: COLORS.violet,
    card: 'bg-violet-50',
  },
  talent: {
    title: 'Talent',
    question: 'Where are the opportunities?',
    text: 'Startup jobs, hiring and opportunities with company context.',
    tags: ['Startup jobs', 'Hiring', 'Company context'],
    icon: HiOutlineUsers,
    color: COLORS.blue,
    card: 'bg-blue-50',
  },
}

const LayerCard = ({ layer }) => {
  const Icon = layer.icon
  return (
    <div
      className={`${layer.card} rounded-2xl p-6 flex flex-col h-full border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(15,27,61,0.08)]`}
      style={{ '--accent': layer.color }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold leading-none" style={{ ...HEADING, color: layer.color }}>
            {layer.title}
          </h3>
          <p className="font-aptos-semibold text-xs uppercase tracking-wider text-slate-500 mt-2">
            {layer.question}
          </p>
        </div>
        <span
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-xl"
          style={{ color: layer.color, background: `${layer.color}1a` }}
        >
          <Icon />
        </span>
      </div>
      <p className="font-aptos-regular text-slate-700 text-[15px] leading-snug mt-4">
        {layer.text}
      </p>
      <div className="flex flex-wrap gap-2 mt-auto pt-5">
        {layer.tags.map((tag) => (
          <span
            key={tag}
            className="font-aptos-semibold text-xs rounded-full px-3 py-1 bg-white"
            style={{ color: layer.color }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

const Node = ({ icon: Icon, title, question, color, className }) => (
  <div
    className={`absolute w-[31%] aspect-square rounded-full flex flex-col items-center justify-center text-center text-white transition-transform duration-300 hover:scale-105 ${className}`}
    style={{ background: color, boxShadow: `0 12px 32px ${color}55` }}
  >
    <Icon className="text-2xl sm:text-3xl mb-1" />
    <span className="font-aptos-bold text-sm sm:text-lg leading-none">{title}</span>
    <span className="font-aptos-regular text-[10px] sm:text-xs leading-tight mt-1 px-2 opacity-90">
      {question}
    </span>
  </div>
)

const EcosystemDiagram = () => (
  <div className="relative w-full max-w-[420px] aspect-square mx-auto">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
      <defs>
        {Object.entries(COLORS).map(([id, fill]) => (
          <marker key={id} id={`arrow-${id}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={fill} />
          </marker>
        ))}
      </defs>
      <circle cx="50" cy="50" r="36" stroke="#e2e5f0" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <path d="M64 14 Q80 18 86 32" stroke={COLORS.orange} strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#arrow-orange)" />
      <path d="M86 68 Q80 82 66 86" stroke={COLORS.violet} strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#arrow-violet)" />
      <path d="M34 86 Q20 82 14 68" stroke={COLORS.blue} strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#arrow-blue)" />
      <path d="M14 32 Q20 18 34 14" stroke={COLORS.pink} strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#arrow-pink)" />
    </svg>

    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-full bg-white shadow-[0_0_50px_rgba(255,112,16,0.15)] flex flex-col items-center justify-center text-center">
      <p className={`${NAVY} text-base sm:text-xl font-semibold leading-tight`} style={HEADING}>
        One
        <br />
        ecosystem
      </p>
      <span className="w-6 h-[2px] bg-[#ff7010] my-2" aria-hidden="true" />
      <p className="font-aptos-semibold text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-slate-500 leading-relaxed">
        Four layers
      </p>
    </div>

    <Node icon={HiOutlineNewspaper} title="NEWS" question="What happened?" color={COLORS.pink} className="left-1/2 top-0 -translate-x-1/2" />
    <Node icon={HiOutlineChartBar} title="DATA" question="What are the numbers?" color={COLORS.orange} className="right-0 top-1/2 -translate-y-1/2" />
    <Node icon={HiOutlineDocumentMagnifyingGlass} title="ANALYSIS" question="Why does it matter?" color={COLORS.violet} className="left-1/2 bottom-0 -translate-x-1/2" />
    <Node icon={HiOutlineUsers} title="TALENT" question="Where are the opportunities?" color={COLORS.blue} className="left-0 top-1/2 -translate-y-1/2" />
  </div>
)

const PRODUCTS = [
  {
    title: 'DSJ News',
    text: 'Authoritative coverage of fundraising across stages, mergers and acquisitions, IPOs, launches and key company developments.',
    icon: HiOutlineNewspaper,
    color: COLORS.pink,
    card: 'bg-pink-50/70',
    chips: [
      { label: 'Pre-seed', to: '/preseed' },
      { label: 'Seed', to: '/seed' },
      { label: 'Growth', to: '/growth' },
      { label: 'M&A', to: '/ma' },
      { label: 'IPO', to: '/ipo' },
    ],
    cta: { label: 'Explore News', to: '/' },
  },
  {
    title: 'DSJ Insights',
    text: 'In-depth data reports on fundraising, investor participation, valuation multiples and the financial performance of emerging companies.',
    icon: HiOutlineChartBar,
    color: COLORS.orange,
    card: 'bg-orange-50/70',
    links: [
      { label: 'DSJ Latest Deal Insights', to: '/latest' },
      { label: 'DSJ Funding 365', to: '/funding' },
      { label: 'DSJ Financial Insights', to: '/financial' },
    ],
    cta: { label: 'Explore Insights', to: '/dsj-insight' },
  },
  {
    title: 'Jobs',
    text: 'Connecting talent with opportunities at startups and new-age companies, with meaningful company context.',
    icon: HiOutlineUsers,
    color: COLORS.violet,
    card: 'bg-violet-50/70',
    points: [
      'Roles at startups and new-age companies',
      'Company context alongside every opportunity',
    ],
    cta: { label: 'Explore Jobs', to: '/jobs' },
  },
]

const AUDIENCES = [
  { label: 'Founders', icon: HiOutlineRocketLaunch, color: COLORS.pink },
  { label: 'Investors', icon: HiOutlineBanknotes, color: COLORS.orange },
  { label: 'Professionals', icon: HiOutlineBriefcase, color: COLORS.violet },
  { label: 'Talent', icon: HiOutlineAcademicCap, color: COLORS.blue },
]

const ProductCard = ({ product }) => {
  const { title, text, icon: Icon, color, card, chips, links, points, cta } = product
  return (
    <div
      className={`${card} rounded-2xl p-6 sm:p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(15,27,61,0.08)]`}
    >
      <div className="flex items-center gap-4 mb-4">
        <span
          className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-white text-2xl"
          style={{ background: color, boxShadow: `0 8px 20px ${color}40` }}
        >
          <Icon />
        </span>
        <h3 className="text-2xl font-bold" style={{ ...HEADING, color }}>
          {title}
        </h3>
      </div>
      <p className="font-aptos-regular text-slate-700 text-[15px] leading-relaxed">{text}</p>

      {chips && (
        <div className="flex flex-wrap gap-2 mt-5">
          {chips.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="font-aptos-semibold text-xs rounded-full px-3 py-1.5 bg-white border transition-colors hover:text-white"
              style={{ color, borderColor: `${color}33` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = color)}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}

      {links && (
        <ul className="mt-5 space-y-2.5">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="font-aptos-semibold text-sm text-slate-800 hover:text-[#ff7010] transition-colors inline-flex items-center gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {points && (
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="font-aptos-regular text-sm text-slate-700 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />
              {p}
            </li>
          ))}
        </ul>
      )}

      <Link
        to={cta.to}
        className="font-aptos-bold text-sm tracking-widest uppercase mt-auto pt-6 inline-flex items-center gap-2 hover:gap-3 transition-all"
        style={{ color }}
      >
        {cta.label} <HiArrowRight />
      </Link>
    </div>
  )
}

const AboutUs = () => {
  document.title = 'About Us | DealStreetJournal'
  return (
    <div className="w-full bg-[#fbfbfd] overflow-hidden">

      {/* Intro + founder note */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ffe3cc 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto w-[90%] py-12 lg:py-20">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <Eyebrow>About Deal Street Journal</Eyebrow>
              <h1 className={`${NAVY} text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.08] tracking-tight`} style={HEADING}>
                The intelligence layer for India’s{' '}
                <span className="relative whitespace-nowrap">
                  new-age economy
                  <span className="absolute left-0 right-0 -bottom-1 h-[6px] rounded-full bg-[#ff7010]/25" aria-hidden="true" />
                </span>
              </h1>
              <div className="w-14 h-[3px] bg-[#ff7010] my-7" />
              <p className="font-aptos-regular text-slate-700 text-base sm:text-lg leading-relaxed">
                Deal Street Journal (
                <Link to="/" className="font-aptos-bold text-[#ff7010]">
                  DSJ
                </Link>
                ) is a business intelligence and media platform focused on
                India’s new-age companies. We bring together credible business
                news, company intelligence, deal activity, financial insights and
                talent opportunities to provide a clearer perspective on the
                businesses shaping India’s next phase of growth.
              </p>
              <p className="font-aptos-regular text-slate-600 text-base leading-relaxed mt-4">
                We track the startup ecosystem across fundraising stages
                (pre-seed, seed, growth), mergers and acquisitions, and initial
                public offerings, keeping our readers informed about the
                companies reshaping the economy through their innovations.
              </p>
              <div className="flex flex-wrap gap-2 mt-7">
                {Object.values(LAYERS).map(({ title, icon: Icon, color }) => (
                  <span
                    key={title}
                    className="font-aptos-semibold text-sm inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-slate-700"
                  >
                    <Icon style={{ color }} />
                    {title}
                  </span>
                ))}
              </div>
            </div>

            <figure className="relative rounded-3xl bg-white border border-slate-100 shadow-[0_20px_60px_rgba(15,27,61,0.08)] p-7 sm:p-9">
              <span className="absolute top-0 left-9 right-9 h-[3px] rounded-b-full bg-gradient-to-r from-[#ff7010] to-[#e8336f]" aria-hidden="true" />
              <span
                className="block text-7xl leading-[0.6] text-[#ff7010] mb-3"
                style={HEADING}
                aria-hidden="true"
              >
                “
              </span>
              <Eyebrow>Why I started DSJ</Eyebrow>
              <blockquote className="space-y-4">
                <p className="font-aptos-regular text-slate-700 text-[15px] sm:text-base leading-relaxed">
                  With 17+ years of experience across transactions, tax and
                  regulatory advisory, I often found critical business
                  information to be expensive, fragmented and difficult to turn
                  into actionable insights.
                </p>
                <p className="font-aptos-regular text-slate-700 text-[15px] sm:text-base leading-relaxed">
                  That experience led to DSJ — with a simple purpose: make
                  business intelligence{' '}
                  <span className={`${NAVY} font-aptos-semibold`}>
                    accessible, actionable and affordable
                  </span>
                  , so founders, investors and professionals can focus on what
                  matters — building, investing and growing.
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-4 mt-7 pt-6 border-t border-slate-100">
                <span
                  className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#ff7010] to-[#e8336f] text-white flex items-center justify-center text-lg font-semibold"
                  style={HEADING}
                  aria-hidden="true"
                >
                  NS
                </span>
                <div>
                  <p className={`${NAVY} font-aptos-bold text-sm tracking-widest uppercase`}>
                    Narender Pal Singh
                  </p>
                  <p className="font-aptos-regular text-slate-500 text-sm">
                    Founder, Deal Street Journal
                  </p>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-gradient-to-b from-[#f3f4fa] to-[#fbfbfd] py-16 lg:py-20">
        <div className="max-w-6xl mx-auto w-[90%]">
          <div className="grid lg:grid-cols-2 gap-6 items-end mb-12">
            <div>
              <Eyebrow>How it all connects</Eyebrow>
              <h2 className={`${NAVY} text-3xl sm:text-[42px] font-bold leading-[1.12] tracking-tight`} style={HEADING}>
                One ecosystem.
                <br />
                Four intelligence layers.
              </h2>
            </div>
            <p className="font-aptos-regular text-slate-600 text-base leading-relaxed">
              DSJ connects news, data, analysis and talent within one ecosystem.
              Our platform helps users understand what is happening, what the
              numbers say, why it matters and where the next opportunities are
              emerging.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_1.35fr] items-center">
            <EcosystemDiagram />
            {/* Cards follow the diagram's flow: News → Data → Analysis → Talent */}
            <div className="grid gap-6 sm:grid-cols-2 auto-rows-fr">
              {Object.values(LAYERS).map((layer) => (
                <LayerCard key={layer.title} layer={layer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto w-[90%] py-16 lg:py-20">
        <div className="mb-10">
          <Eyebrow>Three products. One ecosystem.</Eyebrow>
          <h2 className={`${NAVY} text-3xl sm:text-[42px] font-bold tracking-tight`} style={HEADING}>
            Our Products
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.title} product={p} />
          ))}
        </div>
      </section>

      {/* Purpose */}
      <section className="relative bg-gradient-to-b from-[#fff7f0] to-[#fdf1f6] py-16 lg:py-24 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-60 blur-3xl"
          style={{ background: `radial-gradient(circle, ${ORANGE}33 0%, ${COLORS.pink}1a 45%, transparent 70%)` }}
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto w-[90%] text-center">
          <Eyebrow>Our purpose</Eyebrow>
          <h2 className={`${NAVY} text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight`} style={HEADING}>
            Creating one ecosystem for a new age Economy
            {/* <br className="hidden sm:block" /> easier to understand. */}
          </h2>
          <div className="w-14 h-[3px] bg-[#ff7010] mx-auto my-7" />
          <p className="font-aptos-regular text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            We transform business developments and data into meaningful
            intelligence for founders, investors, professionals and talent.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto w-[90%] grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {AUDIENCES.map(({ label, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl bg-white/80 backdrop-blur border border-white shadow-[0_10px_30px_rgba(15,27,61,0.06)] px-5 py-6 flex flex-col items-center text-center gap-3"
            >
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ color, background: `${color}1a` }}
              >
                <Icon />
              </span>
              <span className={`${NAVY} font-aptos-bold text-base`}>{label}</span>
            </div>
          ))}
        </div>

        <p className="relative max-w-3xl mx-auto w-[90%] text-center font-aptos-regular text-slate-600 text-base leading-relaxed mt-10">
          We strive to provide{' '}
          <span className={`${NAVY} font-aptos-semibold`}>unbiased, noise-free and organic information</span>
          , empowering our readers to make informed decisions in this dynamic
          and rapidly evolving ecosystem.
        </p>
      </section>
    </div>
  )
}

export default AboutUs
