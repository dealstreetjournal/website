import axios from './axiosInstance'

export const fetchBlog = async ({ pageParam = 1 }) => {
  try {
    const response = await axios.get(`/dsj/blog?page=${pageParam}`)
    // console.log('Fetched blog:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching blog:', error)
    throw new Error(error.message || 'Failed to fetch blog')
  }
}

export const fetchBlogById = async (slug) => {
  try {
    const response = await axios.get(`/dsj/blog/slug/${slug}`)
    console.log('Fetched blog by slug:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error fetching blog by slug:', error)
    throw new Error(error.message || 'Failed to fetch blog by slug')
  }
}
