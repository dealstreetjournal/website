import axios from './axiosInstance'

export const fetchFiCompanies = async (search = '') => {
  const res = await axios.get(`/api/fi/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  return res.data
}

export const fetchFiCompanyDetail = async (id) => {
  const res = await axios.get(`/api/fi/companies/${id}`)
  return res.data
}

export const initiateFiOrder = async (payload) => {
  const res = await axios.post('/api/fi/order/initiate', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data
}

export const verifyFiOrder = async (orderId) => {
  const res = await axios.get(`/api/fi/order/verify/${orderId}`)
  return res.data
}