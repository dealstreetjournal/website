import React, { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { FaFileInvoice, FaIdCard } from 'react-icons/fa6'
import { MdExitToApp } from 'react-icons/md'
import Profile from '../components/Profile'
import Invoice from '../components/Invoice'
import Report from '../components/Report'
import { useMutation } from '@tanstack/react-query'
import { logout as logoutApi } from '../api/authApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'

const UserDashboard = () => {
  const location = useLocation()
  const [button, setButton] = useState('profile')
  const { query } = location.state || {}
  const navigate = useNavigate()

  useEffect(() => {
    if (query === 'report') {
      setButton('report')
    }
  }, [query])

  const { logout } = useAuth()
  const { resetCartCount } = useCart()

  const mutationLogout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logout()
      resetCartCount()
      Swal.fire({
        title: 'Success!',
        text: 'logout successful!',
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      navigate('/')
    },
    onError: (error) => {
      console.error('Logout error:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Logout failed try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  return (
    <>
      <div className="bg-slate-50 pb-5 w-full mx-auto">
        <div className="max-w-6xl w-[95%] lg:w-[90%] mx-auto py-5">
          <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-5 mt-5 lg:mt-10">
            {/* Left sidebar */}
            <div className="bg-white border-2 w-full lg:w-fit p-3 sm:p-5 border-[#ff7010] rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.25)] lg:sticky lg:top-15 h-fit">
              <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                <li
                  onClick={() => {
                    setButton('profile')
                  }}
                  className={`${
                    button === 'profile'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 lg:gap-2 px-3 lg:px-3 font-aptos-semibold py-1.5 lg:py-1.5 rounded-md text-[#ff7010] text-base lg:text-lg hover:text-white transition-all duration-300 whitespace-nowrap flex-shrink-0`}
                >
                  <FaUser className="text-sm lg:text-base" />
                  <span className="hidden sm:inline">Profile</span>
                </li>
                <li
                  onClick={() => {
                    setButton('invoice')
                  }}
                  className={`${
                    button === 'invoice'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 lg:gap-2 px-3 lg:px-3 font-aptos-semibold py-1.5 lg:py-1.5 rounded-md text-[#ff7010] text-base lg:text-lg hover:text-white transition-all duration-300 whitespace-nowrap flex-shrink-0`}
                >
                  <FaIdCard className="text-sm lg:text-base" />
                  <span className="hidden sm:inline">Invoice</span>
                </li>
                <li
                  onClick={() => {
                    setButton('report')
                  }}
                  className={`${
                    button === 'report'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 lg:gap-2 px-3 lg:px-3 font-aptos-semibold py-1.5 lg:py-1.5 rounded-md text-[#ff7010] text-base lg:text-lg hover:text-white transition-all duration-300 whitespace-nowrap flex-shrink-0`}
                >
                  <FaFileInvoice className="text-sm lg:text-base" />
                  <span className="hidden sm:inline">Report</span>
                </li>
                <li
                  onClick={() => mutationLogout.mutate()}
                  className="hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 lg:gap-2 px-3 lg:px-3 font-aptos-semibold py-1.5 lg:py-1.5 rounded-md text-[#ff7010] text-base lg:text-lg hover:text-white transition-all duration-300 whitespace-nowrap flex-shrink-0"
                >
                  <MdExitToApp className="text-sm lg:text-base" />
                  <span className="hidden sm:inline">Logout</span>
                </li>
              </ul>
            </div>

            {/* Right sidebar */}
            <div className="w-full">
              {button === 'profile' ? (
                <Profile />
              ) : button === 'invoice' ? (
                <Invoice />
              ) : button === 'report' ? (
                <Report />
              ) : (
                'profile'
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard
