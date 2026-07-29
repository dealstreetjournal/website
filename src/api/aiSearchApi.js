import axios from './axiosInstance'

export const getAiSuggestions = async (q) => {
  const res = await axios.get('/api/ai/suggest', { params: { q } })
  return res.data
}

export const aiSearchCompany = async (companyId, query) => {
  const res = await axios.post('/api/ai/search', { companyId, query })
  return res.data
}

export const aiFreeSearch = async (query) => {
  const res = await axios.post('/api/ai/free-search', { query })
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