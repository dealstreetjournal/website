const isProd = import.meta.env.PROD

const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (isProd ? 'https://web.dealstreetjournal.com' : 'http://localhost:8081'),
  DSJ_API_URL:
    import.meta.env.VITE_DSJ_API_URL ||
    (isProd ? 'https://api.dealstreetjournal.com' : 'http://localhost:8080'),
  // AI Search now calls the Python engine (DSJ-AI) directly from the browser instead of
  // going through websitebackend as a proxy -- product decision (2026-08-31): no reason to
  // route through Java for a call Java only ever forwarded unchanged. VITE_DSJ_AI_URL
  // overrides this at build time; the prod fallback below is DSJ-AI's live domain.
  DSJ_AI_URL:
    import.meta.env.VITE_DSJ_AI_URL ||
    (isProd ? 'https://financialai.dealstreetjournal.com' : 'http://localhost:8090'),
  COLLECT_URL:
    import.meta.env.VITE_COLLECT_URL ||
    (isProd
      ? 'https://web.dealstreetjournal.com/dsj/collect'
      : 'http://localhost:8081/dsj/collect'),  IP_API_URL: import.meta.env.VITE_IP_API_URL || 'https://ipapi.co/json/',
  SITE_URL:
    import.meta.env.VITE_SITE_URL ||
    (isProd ? 'https://dealstreetjournal.com' : 'http://localhost:5173'),
  AI_ACCESS_EMAILS: [
    'support@dealstreetjournal.com',
    'prabhatsingh7557@gmail.com',
  ],
}

export default config
