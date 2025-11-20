import axios from './axiosInstance'

export const sendOtpToEmail = async ({ email }) => {
  try {
    // console.log('send otp', email)
    const response = await axios.post('/dsj/send-otp', { email })
    // console.log('Fetched send top:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error sendOtp:', error.response.data)
    throw new Error(error.message || 'Failed to send OTP')
  }
}

export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post('/dsj/verify-otp', { email, otp })
    // console.log('Fetched verify top:', response.data)
    return response.data
  } catch (error) {
    // console.error('Error verifyOtp:', error)
    throw new Error(error.message || 'Failed to verify OTP')
  }
}

export const signup = async (data) => {
  try {
    const response = await axios.post('/dsj/register', data)
    // console.log('signup res', response.data)
    return response.data
  } catch (error) {
    // console.error('Error singup:', error)
    throw new Error(error.message || 'Failed to signup')
  }
}

export const login = async (data) => {
  try {
    // console.log('before', data)
    const response = await axios.post('/dsj/login', data)
    // console.log('fetch logn res', response.data)
    return response.data
  } catch (error) {
    // console.error('error login', error)
    throw new Error(error.message || 'Failed to login')
  }
}

export const logout = async () => {
  try {
    const response = await axios.post('/dsj/logout')
    // console.log('fetch logout', response.data)
    return response.data
  } catch (error) {
    // console.error('error logout', error)
    throw new Error(error.message || 'Failed to logout')
  }
}

// send mail due to forgot password
export const forgotPassword = async ({ email }) => {
  try {
    // console.log('email', email)
    const response = await axios.post('/dsj/forgot-password', { email })
    // console.log('Email Send forgot-password', response.data)
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Failed to send OTP')
  }
}

// reset password api
export const resetPassword = async ({ password, token, email }) => {
  try {
    // console.log('password', password)
    const response = await axios.post('/dsj/reset-password', {
      password,
      token,
      email,
    })
    // console.log('reset-password', response.data)
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Failed to reset password')
  }
}
