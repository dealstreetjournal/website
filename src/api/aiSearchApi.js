import axios from './axiosInstance'

export const getAiSuggestions = async (q) => {
  const res = await axios.get('/api/ai/suggest', { params: { q } })
  return res.data
}

export const aiSearchCompany = async (companyId, query) => {
  const res = await axios.post('/api/ai/search', { companyId, query })
  return res.data
}

// `conversationId` groups every search in the same browser thread under ONE history entry
// server-side (ChatGPT/Claude-style) — pass the same id for every follow-up in a thread, a
// fresh one only when starting a new chat. Optional — omitting it (or passing null) still
// saves a normal (new) history row, just not linked to any earlier turn.
export const aiFreeSearch = async (query, conversationId) => {
  const res = await axios.post('/api/ai/free-search', { query, conversationId })
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