import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://web.dealstreetjournal.com'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export default axiosInstance
