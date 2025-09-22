import axios from 'axios'

const API_BASE_URL = 'https://web.dealstreetjournal.com'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export default axiosInstance

// git add karn eke liye use kiya hu ye comment