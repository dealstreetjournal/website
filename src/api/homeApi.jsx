import axios from './axiosInstance'

// export const home = async () => {
//   try {
//     const response = await axios.get('/dsj/home')
//     // console.log('Fetched home:', response.data)
//     console.log('Fetched home data:', response.data)
//     return response.data
//   } catch (error) {
//     // console.error('Error fetching home:', error)
//     throw new Error(error.message || 'Failed to fetch home data')
//   }
// }

export const getSliders = async () => {
  const response = await axios.get('/dsj/sliders')
  return response.data
}

export const getWorldDeals = async () => {
  const response = await axios.get('/dsj/world-deals')
  return response.data
}

export const getLatestDeals = async () => {
  const response = await axios.get('/dsj/latestdsj')
  return response.data
}

export const getSeedGrowth = async () => {
  const response = await axios.get('/dsj/seed-growth')
  return response.data
}

export const getFunding = async () => {
  const response = await axios.get('/dsj/fundingdsj')
  return response.data
}

export const getMAPreseed = async () => {
  const response = await axios.get('/dsj/ma-preseed')
  return response.data
}

export const getIPO = async () => {
  const response = await axios.get('/dsj/ipo')
  return response.data
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
