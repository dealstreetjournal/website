import axios from './axiosInstance'

export const fetchDeal = async (dealType, page) => {
  try {
    const response = await axios.get(`/dsj/deal/type/${dealType}?page=${page}`)
    // console.log('Fetched deal:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching world:', error)
    throw new Error(error.message || 'Failed to fetch deal')
  }
}

export const fetchDealById = async (dealType, id) => {
  try {
    const response = await axios.get(`/dsj/deal/id/${id}/type/${dealType}`)
    // console.log('Fetched deal by ID:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching deal by ID:', error)
    throw new Error(error.message || 'Failed to fetch deal by ID')
  }
}
