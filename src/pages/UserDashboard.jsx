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

  const mutationLogout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logout()
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
      <div className=" bg-slate-50 pb-5 w-full mx-auto">
        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <div className="grid grid-cols-[30%_70%] mt-10">
            {/* left sidebar */}
            <div className="bg-white border-2 w-fit p-5 border-[#ff7010] rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.25)] sticky top-15 h-fit">
              <ul>
                <li
                  onClick={() => {
                    setButton('profile')
                  }}
                  className={`${
                    button === 'profile'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 mb-2.5 px-3 font-aptos-semibold py-1.5 rounded-md text-[#ff7010] text-lg hover:text-white transition-all duration-300`}
                >
                  <FaUser /> Profile
                </li>
                <li
                  onClick={() => {
                    setButton('invoice')
                  }}
                  className={`${
                    button === 'invoice'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 mb-2.5 px-3 font-aptos-semibold py-1.5 rounded-md text-[#ff7010] text-lg hover:text-white transition-all duration-300`}
                >
                  <FaIdCard /> Invoice
                </li>
                <li
                  onClick={() => {
                    setButton('report')
                  }}
                  className={`${
                    button === 'report'
                      ? 'bg-[#ff7010] text-white font-aptos-semibold'
                      : ''
                  } hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 mb-2.5 px-3 font-aptos-semibold py-1.5 rounded-md text-[#ff7010] text-lg hover:text-white transition-all duration-300`}
                >
                  <FaFileInvoice /> Report
                </li>
                <li
                  onClick={() => mutationLogout.mutate()}
                  className="hover:bg-[#ff7010] cursor-pointer flex justify-center items-center gap-1 px-3 font-aptos-semibold py-1.5 rounded-md text-[#ff7010] text-lg hover:text-white transition-all duration-300"
                >
                  <MdExitToApp /> Logout
                </li>
              </ul>
            </div>

            {/* right sidebar */}
            <div className="">
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
