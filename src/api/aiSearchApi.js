import axios from './axiosInstance'
import plainAxios from 'axios'
import config from '../config'

export const getAiSuggestions = async (q) => {
  const res = await axios.get('/api/ai/suggest', { params: { q } })
  return res.data
}

export const aiSearchCompany = async (companyId, query) => {
  const res = await axios.post('/api/ai/search', { companyId, query })
  return res.data
}

// Calls the Python engine (DSJ-AI) directly, bypassing websitebackend entirely (product
// decision, 2026-08-31) — that Java endpoint only ever forwarded the query unchanged and
// fell back to its own (now-frozen) engine on failure, so routing through it added a hop
// with no benefit while DSJ-AI is what's actively being iterated on. `plainAxios`, not the
// shared `axios` instance: DSJ-AI is a separate origin with no session/cookie of its own,
// so `withCredentials` would only risk a CORS rejection for nothing gained.
// NOTE: bypassing Java also means AiSearchController's own history auto-save
// (historyService.save) never runs for these searches -- a known, accepted gap for now.
export const aiFreeSearch = async (query, userEmail) => {
  const res = await plainAxios.post(`${config.DSJ_AI_URL}/free-search`, {
    query, user_email: userEmail || null,
  })
  return res.data
}

export const getAiHistory = async () => {
  const res = await axios.get('/api/ai/history')
  return res.data
}

export const getAiHistoryDetail = async (id) => {
  const res = await axios.get(`/api/ai/history/${id}`)
  return res.data
}

export const deleteAiHistoryItem = async (id) => {
  const res = await axios.delete(`/api/ai/history/${id}`)
  return res.data
}

export const clearAiHistory = async () => {
  const res = await axios.delete('/api/ai/history')
  return res.data
}

export const downloadIntelligencePdf = async (result) => {
  const res = await axios.post('/api/ai/intelligence-pdf', result, { responseType: 'blob' })
  return res.data
}