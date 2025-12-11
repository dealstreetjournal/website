import axios from './axiosInstance'

export const addToCart = async (data) => {
  try {
    // console.log('Adding to cart:', data)
    const response = await axios.post('/dsj/cart', data)
    // console.log('Fetched cart:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error cart:', error.response.data)
    // throw new Error(error.message || 'Failed to add to cart')
    throw error
  }
}

export const fetchCart = async () => {
  try {
    const response = await axios.get('/dsj/cart')
    // console.log(response.data)
    return response.data
  } catch (error) {
    // console.error('fetch cart error ', error)
    throw new Error(error.message || 'Failed to fetch cart')
  }
}

export const removeFromCart = async (productId, title) => {
  try {
    const response = await axios.delete(`/dsj/cart/${productId}?title=${title}`)
    // console.log(response.data)
  } catch (error) {
    // console.log(error)
    throw new Error(error.message || 'Failed to remove from cart')
  }
}

export const cartCountApi = async () => {
  try {
    const response = await axios.get(`/dsj/cart/count`)
    return response.data
  } catch (error) {
    // console.log(error)
    throw new Error(error.message || 'Failed to fetch cart count')
  }
}

export const initiatePayment = async (formData) => {
  const payload = {
    userName: formData.fullName,
    userPhone: formData.mobile,
    country: formData.country,
    state: formData.state || formData.customCountry,
  }

  // console.log('Initiating payment with data api:', payload)

  try {
    const response = await axios.post('/dsj/payment/initiate', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    // console.error('Error initiating payment:', error)
    throw new Error(error.message || 'Failed to initiate payment')
  }
}
