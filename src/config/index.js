const isProd = import.meta.env.PROD

const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (isProd ? 'https://web.dealstreetjournal.com' : 'http://localhost:8081'),
  DSJ_API_URL:
    import.meta.env.VITE_DSJ_API_URL ||
    (isProd ? 'https://api.dealstreetjournal.com' : 'http://localhost:8080'),
  COLLECT_URL:
    import.meta.env.VITE_COLLECT_URL ||
    (isProd
      ? 'https://web.dealstreetjournal.com/dsj/collect'
      : 'http://localhost:8081/dsj/collect'),
  IP_API_URL: import.meta.env.VITE_IP_API_URL || 'https://ipapi.co/json/',
  SITE_URL:
    import.meta.env.VITE_SITE_URL ||
    (isProd ? 'https://dealstreetjournal.com' : 'http://localhost:5173'),
  AI_ACCESS_EMAILS: [
    'support@dealstreetjournal.com',
    'prabhatsingh7557@gmail.com',
  ],
}

export default config
