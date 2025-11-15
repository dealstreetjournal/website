import axios from './axiosInstance'

export const userData = async () => {
  try {
    const response = await axios.get('/user/profile')
    console.log('user', response.data)
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Failed to send OTP')
  }
}

export const sendEmailOtp = async ({ email }) => {
  try {
    const response = await axios.post('/user/send-email-otp', { email })
    console.log('updateEmailSend', response.data)
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Failed to send OTP')
  }
}

// Verify email OTP and update email
export const verifyEmailOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post('/user/verify-email-otp', { email, otp })
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Invalid OTP or OTP expired')
  }
}

// Update mobile number
export const updateMobile = async ({ mobile }) => {
  try {
    const response = await axios.put('/user/update-mobile', { mobile })
    return response
  } catch (error) {
    throw new Error(error.message || 'Failed to update mobile number')
  }
}

export const contactMail = async (data) => {
  try {
    const response = await axios.post('/dsj/contactus-email', data)
    console.log('updateEmailSend', response.data)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data || error.message || 'Failed to send email'
    )
  }
}

export const getInvoice = async () => {
  try {
    const response = await axios.get('/dsj/report/invoice')
    console.log('invoice res:', response.data)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data || error.message || 'Failed to load Invoice'
    )
  }
}

export const getReport = async () => {
  try {
    const response = await axios.get('/dsj/report')
    console.log('report res:', response.data)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data || error.message || 'Failed to load Report'
    )
  }
}
