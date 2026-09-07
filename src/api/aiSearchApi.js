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
// `conversationId` (from AiSearchPage.jsx's own per-thread state) lets DSJ-AI's own
// history_engine.py group every turn of one browser conversation into a single saved row,
// same threading websitebackend's AiSearchController used to do before this call moved off
// of it — see that module's own docstring for why history-saving lives here now too.
export const aiFreeSearch = async (query, userEmail, conversationId) => {
  const res = await plainAxios.post(`${config.DSJ_AI_URL}/free-search`, {
    query, user_email: userEmail || null, conversation_id: conversationId || null,
  })
  return res.data
}

// History now lives in DSJ-AI (see history_engine.py) alongside the search that populates
// it, not websitebackend — that Java table/service still exist and still hold everything
// saved before this moved, but nothing on the frontend calls them anymore. DSJ-AI has no
// session of its own, so the user's email is sent explicitly rather than inferred
// server-side from a cookie the way the old Java endpoints did.
export const getAiHistory = async (userEmail) => {
  const res = await plainAxios.get(`${config.DSJ_AI_URL}/history`, { params: { user_email: userEmail } })
  return res.data
}

export const getAiHistoryDetail = async (id, userEmail) => {
  const res = await plainAxios.get(`${config.DSJ_AI_URL}/history/${id}`, { params: { user_email: userEmail } })
  return res.data
}

export const deleteAiHistoryItem = async (id, userEmail) => {
  const res = await plainAxios.delete(`${config.DSJ_AI_URL}/history/${id}`, { params: { user_email: userEmail } })
  return res.data
}

export const clearAiHistory = async (userEmail) => {
  const res = await plainAxios.delete(`${config.DSJ_AI_URL}/history`, { params: { user_email: userEmail } })
  return res.data
}

export const downloadIntelligencePdf = async (result) => {
  const res = await axios.post('/api/ai/intelligence-pdf', result, { responseType: 'blob' })
  return res.data
}