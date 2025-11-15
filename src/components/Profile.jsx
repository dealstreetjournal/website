import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ImCross } from 'react-icons/im'
import { FaUser } from 'react-icons/fa6'
import { RxCross2 } from 'react-icons/rx'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logout as logoutApi } from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  sendEmailOtp,
  updateMobile,
  updateName,
  userData,
  verifyEmailOtp,
} from '../api/userApi'
import spinner from '../assets/spinner.png'
import Swal from 'sweetalert2'
import { MdModeEdit } from 'react-icons/md'

const Profile = () => {
  document.title = 'Profile | Dealstreetjournal'
  const [email, setEmail] = useState(false)
  const [phone, setPhone] = useState(false)
  const [name, setName] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [pendingEmail, setPendingEmail] = useState('')
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { logout } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    // watch,
    // setValue,
  } = useForm()

  const {
    isPending,
    isError,
    data: userdata,
    error,
  } = useQuery({
    queryKey: ['userData'],
    queryFn: userData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // OTP Timer effect
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(otpTimer - 1)
      }, 1000)
    } else if (otpTimer === 0 && showOtpInput) {
      setShowOtpInput(false)
      setPendingEmail('')
      Swal.fire({
        title: 'Warning!',
        text: 'OTP expired! Please try again.',
        icon: 'warning',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    }
    return () => clearInterval(interval)
  }, [otpTimer, showOtpInput])

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Logout mutation
  const mutationLogout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logout()
      Swal.fire({
        title: 'Success!',
        text: 'Logout successful!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      navigate('/login')
    },
    onError: (error) => {
      console.error('Logout error:', error)

      Swal.fire({
        title: 'Error!',
        text: 'Logout faile try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  // Send Email OTP mutation
  const mutationSendEmailOtp = useMutation({
    mutationFn: sendEmailOtp,
    onSuccess: () => {
      setShowOtpInput(true)
      setOtpTimer(120) // 2 minutes
      Swal.fire({
        title: 'Success!',
        text: 'OTP sent successfully to your email!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
    onError: (error) => {
      console.error('Send OTP error:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send Otp try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  // Verify Email OTP mutation
  const mutationVerifyEmailOtp = useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => {
      setEmail(false)
      setShowOtpInput(false)
      setOtpTimer(0)
      setPendingEmail('')
      reset()
      Swal.fire({
        title: 'Success!',
        text: 'Email update successfully!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
      })
      logout()
      navigate('/login')
    },
    onError: (error) => {
      console.error('Verify OTP error:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Invalid OTP or OTP expired!',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  // Update Mobile mutation
  const mutationUpdateMobile = useMutation({
    mutationFn: updateMobile,
    onSuccess: () => {
      setPhone(false)
      reset()
      Swal.fire({
        title: 'Success!',
        text: 'Mobile number updated successfully!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['userData'] })
    },
    onError: (error) => {
      console.error('Update mobile error:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update mobile number',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  const mutationUpdateName = useMutation({
    mutationFn: updateName,
    onSuccess: () => {
      setName(false)
      reset()
      Swal.fire({
        title: 'Success!',
        text: 'Name updated successfully!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['userData'] })
    },
    onError: (error) => {
      console.error('Update Name error:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update Name',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  const handleEmailSubmit = (data) => {
    if (showOtpInput) {
      // Verify OTP
      mutationVerifyEmailOtp.mutate({
        email: pendingEmail,
        otp: data.otp,
      })
    } else {
      // Send OTP
      setPendingEmail(data.email)
      mutationSendEmailOtp.mutate({
        email: data.email,
      })
    }
  }

  const handleMobileSubmit = (data) => {
    mutationUpdateMobile.mutate({ mobile: data.mobile })
  }

  const handleNameSubmit = (data) => {
    mutationUpdateName.mutate({ fullName: data.fullName })
    // console.log('Name submitted:', data.fullName)
  }

  const handleCancelEmail = () => {
    setEmail(false)
    setShowOtpInput(false)
    setOtpTimer(0)
    setPendingEmail('')
    reset()
  }

  const handleCancelMobile = () => {
    setPhone(false)
    reset()
  }
  const handleCancelName = () => {
    setName(false)
    reset()
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          loading="lazy"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <>
      <div className="bg-white flex flex-col justify-around items-center gap-3 py-5 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.2)] text-gray-800">
        <div className="p-3 border-3 border-[#ff7010] rounded-full">
          <FaUser size={40} className="text-[#ff7010]" />
        </div>

        <div className="flex justify-center items-center">
          {name ? (
            <>
              <form
                onSubmit={handleSubmit(handleNameSubmit)}
                className="flex justify-center items-center"
              >
                <div className="font-aptos-regular flex flex-col justify-center gap-1">
                  <input
                    type="text"
                    placeholder="Enter full name"
                    {...register('fullName', {
                      required: 'Enter Full Name is required',
                      minLength: {
                        value: 3,
                      },
                      message: 'Name should be at least 3 characters long',
                    })}
                    disabled={mutationUpdateName.isPending}
                    className="border border-gray-300 rounded px-2 py-1 font-aptos-regular text-gray-600"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={mutationUpdateName.isPending}
                  className="font-aptos-semibold bg-[#ff7010] px-3 py-1.5 rounded-sm text-white cursor-pointer ml-1.5 text-sm"
                >
                  {mutationUpdateName.isPending ? 'Updating...' : 'Update'}
                </button>
              </form>
              <RxCross2
                onClick={handleCancelName}
                className="font-aptos-semibold ml-1.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-all duration-500 hover:rotate-180"
              />
            </>
          ) : (
            <>
              <h1 className="font-aptos-bold text-2xl">
                Hello, {userdata?.fullName || userdata?.email}
              </h1>

              <p
                onClick={() => {
                  setPhone(false)
                  setEmail(false)
                  setName(true)
                }}
                className="font-aptos-semibold text-[#ff7010] cursor-pointer ml-1.5 hover:text-[#e55a00]"
              >
                <MdModeEdit />
              </p>
            </>
          )}
        </div>

        {/* email */}
        <div className="font-aptos-bold text-lg flex justify-center items-center">
          {/* <span>Email :&nbsp;</span> */}

          {email ? (
            <>
              <form
                onSubmit={handleSubmit(handleEmailSubmit)}
                className="flex justify-center items-center gap-2"
              >
                {!showOtpInput ? (
                  // Email input
                  <div className="flex gap-2 justify-center items-center">
                    <div className="font-aptos-regular flex flex-col justify-center gap-1">
                      <input
                        type="email"
                        placeholder="Enter new email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Enter a valid email address',
                          },
                        })}
                        className="border border-gray-300 rounded px-2 py-1 font-aptos-regular text-gray-600"
                        disabled={mutationSendEmailOtp.isPending}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={mutationSendEmailOtp.isPending}
                      className="font-aptos-semibold bg-[#ff7010] px-3 py-1.5 rounded-sm text-white cursor-pointer ml-1.5 text-sm disabled:opacity-50"
                    >
                      {mutationSendEmailOtp.isPending
                        ? 'Sending...'
                        : 'Send'}
                    </button>
                  </div>
                ) : (
                  // OTP input
                  <div className="flex flex-col justify-center items-center gap-2">
                    <p className="text-sm text-gray-600">
                      OTP sent to: {pendingEmail}
                    </p>
                    <div className="flex justify-center items-center">
                      <div className="font-aptos-regular flex flex-col justify-center gap-1">
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
                          className="border border-gray-300 rounded px-2 py-1 font-aptos-regular text-gray-600 text-center"
                          disabled={mutationVerifyEmailOtp.isPending}
                        />
                        {errors.otp && (
                          <p className="text-red-500 text-sm">
                            {errors.otp.message}
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={
                          mutationVerifyEmailOtp.isPending || otpTimer === 0
                        }
                        className="font-aptos-semibild bg-[#ff7010] px-3 py-1.5 rounded-sm text-white cursor-pointer ml-1.5 text-sm disabled:opacity-50"
                      >
                        {mutationVerifyEmailOtp.isPending
                          ? 'Verifying...'
                          : 'Verify'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Time remaining: {formatTimer(otpTimer)}
                    </p>
                  </div>
                )}
              </form>

              <RxCross2
                onClick={handleCancelEmail}
                className="font-aptos-semibold ml-1.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-all duration-500 hover:rotate-180"
              />
            </>
          ) : (
            <>
              <p className="font-aptos-regular">{userdata.email}</p>

              <p
                onClick={() => {
                  setEmail(true)
                  setPhone(false)
                  setName(false)
                }}
                className="font-aptos-semibold text-[#ff7010] cursor-pointer ml-1.5 hover:text-[#e55a00]"
              >
                <MdModeEdit />
              </p>
            </>
          )}
        </div>

        {/* mobile */}
        <div className="font-aptos-bold text-lg flex justify-center items-center">
          {/* <span>Mobile :&nbsp;</span> */}

          {phone ? (
            <>
              <form
                onSubmit={handleSubmit(handleMobileSubmit)}
                className="flex justify-center items-center"
              >
                <div className="font-aptos-regular flex flex-col justify-center gap-1">
                  <input
                    type="text"
                    placeholder="Enter mobile number"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Enter a valid 10-digit number',
                      },
                    })}
                    className="border border-gray-300 rounded px-2 py-1 font-aptos-regular text-gray-600"
                    disabled={mutationUpdateMobile.isPending}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={mutationUpdateMobile.isPending}
                  className="font-aptos-semibold bg-[#ff7010] px-3 py-1.5 rounded-sm text-white cursor-pointer ml-1.5 text-sm disabled:opacity-50"
                >
                  {mutationUpdateMobile.isPending ? 'Updating...' : 'Update'}
                </button>
              </form>

              <RxCross2
                onClick={handleCancelMobile}
                className="font-aptos-semibold ml-1.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-all duration-500 hover:rotate-180"
              />
            </>
          ) : (
            <>
              <p className="font-aptos-regular">{userdata.mobile}</p>

              <p
                onClick={() => {
                  setPhone(true)
                  setEmail(false)
                  setName(false)
                }}
                className="font-aptos-semibold text-[#ff7010] cursor-pointer ml-1.5 hover:text-[#e55a00]"
              >
                <MdModeEdit />
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => mutationLogout.mutate()}
          disabled={mutationLogout.isPending}
          className="bg-[#ff7010] px-3 py-1 cursor-pointer font-aptos-semibold text-white rounded hover:bg-[#e55a00] disabled:opacity-50"
        >
          {mutationLogout.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </>
  )
}

export default Profile
