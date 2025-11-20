import axios from './axiosInstance'

export const fetchLatestDeal = async (page, companyName = '') => {
  try {
    const response = await axios.get(
      `/dsj/latest?page=${page}${
        companyName ? `&companyName=${encodeURIComponent(companyName)}` : ''
      }`
    )
    // console.log('Fetched latest deal:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching latest deal:', error)
    throw new Error(error.message || 'Failed to fetch latest deal')
  }
}

// Fetching funding company api
export const fetchFundingCompany = async () => {
  try {
    const response = await axios.get('/dsj/funding')
    // console.log('Fetched fundingcompany:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching fundingcompany:', error)
    throw new Error(error.message || 'Failed to fetch funding company')
  }
}

export const fetchFundingCompanyDetails = async (companyId, page) => {
  try {
    const response = await axios.get(`/dsj/funding/${companyId}?page=${page}`)
    // console.log('Fetched fundingcompany details:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching fundingcompany details:', error)
    throw new Error(error.message || 'Failed to fetch funding company details')
  }
}

//below are financial api start
export const fetchFinancialCompany = async () => {
  try {
    const response = await axios.get('/dsj/financial')
    // console.log('Fetched financialcompany:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching financialcompany:', error)
    throw new Error(error.message || 'Failed to fetch financial company')
  }
}

export const fetchFinancial = async (id, year) => {
  try {
    const response = await axios.get(
      `/dsj/financial/${id}${year ? `?year=${year}` : ''}`
    )
    // console.log('Fetched financial:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching financial:', error)
    throw new Error(error.message || 'Failed to fetch financial data')
  }
}
