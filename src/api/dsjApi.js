import axios from './axiosInstance'

export const fetchLatestDeal = async (page, companyName = '') => {
  try {
    const response = await axios.get(
      `/dsj/latest?page=${page}${
        companyName ? `&companyName=${encodeURIComponent(companyName)}` : ''
      }`
    )
    console.log('Fetched latest deal:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching latest deal:', error)
    throw error
  }
}

// Fetching funding company api
export const fetchFundingCompany = async () => {
  try {
    const response = await axios.get('/dsj/funding')
    console.log('Fetched fundingcompany:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching fundingcompany:', error)
    throw error
  }
}

export const fetchFundingCompanyDetails = async (companyId, page) => {
  try {
    const response = await axios.get(`/dsj/funding/${companyId}?page=${page}`)
    console.log('Fetched fundingcompany details:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching fundingcompany details:', error)
    throw error
  }
}

//below are financial api
export const fetchFinancialCompany = async () => {
  try {
    const response = await axios.get('/dsj/financial')
    console.log('Fetched financialcompany:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching financialcompany:', error)
    throw error
  }
}

export const fetchFinancial = async (id, year) => {
  try {
    const response = await axios.get(
      `/dsj/financial/${id}${year ? `?year=${year}` : ''}`
    )
    console.log('Fetched financial:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching financial:', error)
    throw error
  }
}
