import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { MdLock } from 'react-icons/md'
import Swal from 'sweetalert2'

const ResetPassword = () => {
  document.title = 'Reset Password | Dealstreetjournal'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  // Logout mutation
  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      Swal.fire({
        title: 'Success!',
        text: data,
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
      navigate('/login')
    },
    onError: (error) => {
      console.error('reset password', error)
      Swal.fire({
        title: 'Error!',
        text: 'Error in reset password try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  const onSubmit = (data) => {
    mutation.mutate({
      password: data.password,
      token: token,
      email: email,
    })
  }

  return (
    <>
      <div className="w-full bg-slate-50 py-10">
        <div className="max-w-[450px] w-[90%] mx-auto p-5 shadow-xl border rounded-md">
          <h1 className="font-aptos-bold text-center text-2xl text-gray-600 mt-2">
            Reset Password
          </h1>
          {/* <p className="font-aptos-regular mt-8 px-2 py-5 border border-red-500 bg-[#F8D7DA] rounded-md">
            Enter your <strong>Email Id</strong> to get reset link !
          </p> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Password */}
            <div className="my-4">
              <div className="flex justify-start items-center p-2 bg-white border border-gray-400 gap-1 rounded focus-within:outline focus-within:outline-[#ff7010] focus-within:border-0">
                <MdLock size={20} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="outline-0 w-full"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <div className="flex justify-start items-center p-2 bg-white border border-gray-400 gap-1 rounded focus-within:outline focus-within:outline-[#ff7010] focus-within:border-0">
                <MdLock size={20} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
                  })}
                  className="outline-0 w-full"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="font-aptos-regular cursor-pointer border-2 mx-auto border-[#ff7010] px-2 py-1 w-fit rounded-md mt-5 hover:bg-[#ff7010] hover:text-white duration-300 transition-all
             disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Reseting...' : 'Reset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
