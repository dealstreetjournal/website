import axios from './axiosInstance'

export const isAuthenticate = async () => {
  try {
    const response = await axios.get('/user/auth', {
      withCredentials: true,
    })
    // console.log('fetch logn res', response.status)
    return response.status
  } catch (error) {
    // console.error('error authenticate', error)
    return error.response?.status || null
  }
}
