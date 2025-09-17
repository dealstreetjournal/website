import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { useForm } from 'react-hook-form'
import { forgotPassword } from '../api/authApi'
import Swal from 'sweetalert2'

const ForgotPassword = () => {
  document.title = 'Forgot Password | Dealstreetjournal'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Logout mutation
  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      reset()
      Swal.fire({
        title: 'Success!',
        text: data,
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
    onError: (error) => {
      console.error('forgot password', error)
      Swal.fire({
        title: 'Error!',
        text: 'Mail not send try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  const onSubmit = (data) => {
    mutation.mutate({
      email: data.email,
    })
  }

  return (
    <>
      <div className="w-full bg-slate-50 py-10">
        <div className="max-w-[450px] w-[90%] mx-auto p-5 shadow-xl border rounded-md">
          <h1 className="font-aptos-bold text-center text-2xl text-gray-600 mt-2">
            Reset Password
          </h1>
          <p className="font-aptos-regular mt-8 px-2 py-5 border border-red-500 bg-[#F8D7DA] rounded-md">
            Enter your <strong>Email Id</strong> to get reset link !
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="border w-full border-gray-400 p-2 rounded-md mt-5"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="font-aptos-regular cursor-pointer border-2 mx-auto border-[#ff7010] px-2 py-1 w-fit rounded-md mt-5 hover:bg-[#ff7010] hover:text-white transition-all duration-300
             disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Sending...' : 'Send Mail'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
