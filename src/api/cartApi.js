import axios from './axiosInstance'

export const addToCart = async (data) => {
  try {
    const response = await axios.post('/dsj/cart', data)
    // console.log('Fetched cart:', response.data)
    return response.data
  } catch (error) {
    console.error('Error cart:', error)
    throw error
  }
}

export const fetchCart = async () => {
  try {
    const response = await axios.get('/dsj/cart')
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('fetch cart error ', error)
    throw error
  }
}

export const removeFromCart = async (productId, title) => {
  try {
    const response = await axios.delete(`/dsj/cart/${productId}?title=${title}`)
    console.log(response.data)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const cartCountApi = async () => {
  try {
    const response = await axios.get(`/dsj/cart/count`)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
