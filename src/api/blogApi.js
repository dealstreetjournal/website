import axios from './axiosInstance'

export const fetchBlog = async (page) => {
  try {
    const response = await axios.get(`/dsj/blog?page=${page}`)
    // console.log('Fetched blog:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching blog:', error)
    throw new Error(error.message || 'Failed to fetch blog')
  }
}

export const fetchBlogById = async (id) => {
  try {
    const response = await axios.get(`/dsj/blog/id/${id}`)
    // console.log('Fetched blog by ID:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching blog by ID:', error)
    throw new Error(error.message || 'Failed to fetch blog by ID')
  }
}
