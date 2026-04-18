import axios from './axiosInstance'

// export const fetchDeal = async (dealType, page) => {
//   try {
//     const response = await axios.get(`/dsj/deal/type/${dealType}?page=${page}`)
//     // console.log('Fetched deal:', response.data)
//     return response.data
//   } catch (error) {
//     // console.error('Error fetching world:', error)
//     throw new Error(error.message || 'Failed to fetch deal')
//   }
// }

export const fetchDeal = async (dealType, { pageParam = 1 }) => {
  const res = await axios.get(`/dsj/deal/type/${dealType}?page=${pageParam}`)
  console.log('Fetched deal:', res.data)
  return res.data
}

export const fetchDealById = async (dealType, slug) => {
  try {
    const response = await axios.get(`/dsj/deal/slug/${slug}/type/${dealType}`)
    // console.log('Fetched deal by ID:', response.data)
    console.log('Fetched deal by slug:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching deal by ID:', error)
    throw new Error(error.message || 'Failed to fetch deal by ID')
  }
}
