import axios from './axiosInstance'

export const home = async () => {
  try {
    const response = await axios.get('/dsj/home')
    // console.log('Fetched home:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching home:', error)
    throw new Error(error.message || 'Failed to fetch home data')
  }
}

export const fetchSearch = async (query) => {
  try {
    // console.log('Fetching search results for query:', query.trim())
    const response = await axios.get(`/dsj/search?q=${query}`)
    // console.log('Fetched search results:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching search results:', error)
    throw new Error(error.message || 'Failed to fetch search results')
  }
}
