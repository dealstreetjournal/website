import React, { useState, useEffect } from 'react'
import { MdEmail, MdLock, MdPhone } from 'react-icons/md'
import { FaUser, FaSpinner } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Captcha from '../components/Captcha'
import { useMutation } from '@tanstack/react-query'
import { sendOtpToEmail, verifyOtp } from '../api/authApi'
import Swal from 'sweetalert2'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

const Login = () => {
  document.title = 'Login | DealStreetJournal'
  const navigate = useNavigate()

  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResend, setShowResend] = useState(false)

  const { login } = useAuth()
  const { loadCartCount } = useCart()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    getValues,
    trigger, // Add trigger for manual validation
  } = useForm()

  const email = watch('email')

  // Timer effect for OTP expiration
  useEffect(() => {
    let timer
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && otpSent) {
      setShowResend(true)
    }
    return () => clearTimeout(timer)
  }, [timeLeft, otpSent])

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: sendOtpToEmail,
    onSuccess: () => {
      setOtpSent(true)
      setTimeLeft(300) // 5 minutes
      setShowResend(false)
      Swal.fire({
        title: 'Success!',
        text: 'OTP sent successfully to your email!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
      })
    },
    onError: (error) => {
      console.error(error)
      const errorMessage = error.response?.data || 'Failed to send OTP'
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
      })
    },
  })

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      // console.log('user verify and login successful', data)
      reset()
      setOtpSent(false)
      setTimeLeft(0)
      setShowResend(false)
      setIsCaptchaValid(false) // Reset captcha state

      login(email)
      loadCartCount()

      Swal.fire({
        title: 'Success!',
        text: 'Login successful!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
      })
      navigate(-1)
    },
    onError: (error) => {
      console.error(error)
      const errorMessage = error.response?.data || 'Invalid or expired OTP'
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
      })
    },
  })

  // Handle send OTP
  const handleSendOtp = async () => {
    const email = getValues('email')

    // Validate email first
    const emailValid = await trigger('email')
    if (!emailValid) {
      return
    }

    if (!email || !email.match(/^\S+@\S+$/i)) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please enter a valid email address first',
        icon: 'warning',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      return
    }

    sendOtpMutation.mutate({ email })
  }

  // Handle verify OTP and login
  const handleVerifyOtp = async () => {
    const otp = getValues('otp')
    const emailValue = getValues('email')

    // Validate OTP field first
    const otpValid = await trigger('otp')
    if (!otpValid) {
      return
    }

    if (!otp || otp.length !== 6) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please enter a valid 6-digit OTP',
        icon: 'warning',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      return
    }

    if (!isCaptchaValid) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please verify captcha',
        icon: 'warning',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'ok',
        timer: 3000,
      })
      return
    }

    // console.log('Attempting to verify OTP:', {
    //   email: emailValue,
    //   otp: parseInt(otp),
    // })
    verifyOtpMutation.mutate({ email: emailValue, otp: parseInt(otp) })
  }

  // Handle resend OTP
  const handleResendOtp = () => {
    const email = getValues('email')
    sendOtpMutation.mutate({ email })
  }

  // Main form submission - FIXED VERSION
  const onSubmit = async () => {
    // console.log('Form submitted with data:', data)

    // Validate terms and conditions
    const termsValid = await trigger('terms')
    if (!termsValid) {
      return
    }

    if (!otpSent) {
      // If OTP not sent, send it first
      // console.log('OTP not sent, sending OTP...')
      await handleSendOtp()
      return
    }

    // If OTP is sent, verify it and login
    // console.log('OTP sent, verifying OTP...')
    await handleVerifyOtp()
  }

  return (
    <>
      <div className="bg-slate-50 min-h-screen flex justify-center items-center -mt-10 lg:-mt-15">
        <div className="max-w-[450px] w-[90%] mx-auto">
          <h1 className="bg-[#ff7010] rounded-tl-lg rounded-tr-lg text-center font-aptos-bold text-2xl text-white py-7">
            Login
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-slate-200 py-5 px-3 shadow rounded-bl-lg rounded-br-lg"
          >
            {/* Email */}
            <div className="mb-4">
              <div className="flex justify-start border border-gray-300 items-center p-2 bg-white gap-1 rounded focus-within:outline focus-within:outline-[#ff7010]">
                <MdEmail size={20} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  disabled={otpSent}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Enter a valid email address',
                    },
                  })}
                  className="outline-0 w-full disabled:bg-gray-100 font-aptos-regular"
                />
                {otpSent && (
                  <span className="mx-auto flex items-center justify-center h-6 w-6 rounded-full border-2 border-green-600">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* OTP Input */}
            {otpSent && (
              <div className="mb-4">
                <div className="flex justify-start items-center p-2 border border-gray-300 bg-white gap-1 rounded focus-within:outline focus-within:outline-[#ff7010]">
                  <MdLock size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    {...register('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Enter a valid 6-digit OTP',
                      },
                    })}
                    className="outline-0 w-full font-aptos-regular"
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.otp.message}
                  </p>
                )}

                {/* Timer and Verify/Resend Button */}
                <div className="flex items-center font-aptos-regular justify-between mt-2">
                  {!showResend && timeLeft > 0 && (
                    <span className="text-sm text-gray-600">
                      OTP expires in: {formatTime(timeLeft)}
                    </span>
                  )}

                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendOtpMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-4 py-2 text-white text-sm rounded flex items-center gap-2"
                    >
                      {sendOtpMutation.isPending && (
                        <FaSpinner className="animate-spin" />
                      )}
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* captcha - Only show when OTP is sent */}
            {otpSent && (
              <div className="mt-4">
                <Captcha onValidate={setIsCaptchaValid} />
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="my-5">
              <div className="flex justify-start items-center gap-3 font-aptos-regular">
                <input
                  type="checkbox"
                  {...register('terms', {
                    required: 'Please accept terms and conditions',
                  })}
                  className="outline-0"
                />
                <p className="whitespace-nowrap">
                  I accept{' '}
                  <Link
                    to="/terms-of-services"
                    className="text-orange-600 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </p>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center font-aptos-semibold justify-center mt-6">
              <button
                type="submit"
                disabled={
                  sendOtpMutation.isPending || verifyOtpMutation.isPending
                }
                className="bg-[#ff7010] cursor-pointer hover:bg-[#e5630e] disabled:opacity-50 px-8 py-3 text-white text-sm rounded transition-colors flex items-center gap-2"
              >
                {(sendOtpMutation.isPending || verifyOtpMutation.isPending) && (
                  <FaSpinner className="animate-spin" />
                )}
                {!otpSent ? 'Send OTP' : 'Verify OTP & Login'}
              </button>
            </div>

            {/* new user */}
            <div className="flex justify-center items-center gap-2 font-aptos-regular mt-4">
              <FaUser size={15} />
              <span className="text-gray-600">
                New user? Just enter your email to get started!
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login
