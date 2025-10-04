import React, { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchCart, removeFromCart } from '../api/cartApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import Swal from 'sweetalert2'
import { useCart } from '../hooks/useCart'

const Checkout = () => {
  document.title = 'Checkout | Dealstreetjournal'
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')

  const queryClient = useQueryClient()

  const { decrementCartCount } = useCart()

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh',
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
  ]

  const {
    isPending,
    isError,
    data: cartData,
    error,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Mutation for removing items from cart
  const removeMutation = useMutation({
    mutationFn: ({ productId, title }) => removeFromCart(productId, title),
    onSuccess: () => {
      // Refetch cart data after successful removal
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      decrementCartCount()
      Swal.fire({
        title: 'Removed!',
        text: 'Item removed from cart successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
      })
    },
    onError: (error) => {
      console.error('Remove from cart error:', error)

      Swal.fire({
        title: 'Error!',
        text: 'Failed to remove item from cart',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
      })
    },
  })

  const handleRemove = useCallback(
    (productId, title) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this item from cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff7010',
        cancelButtonColor: '#5b93cb',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          removeMutation.mutate({ productId, title })
        }
      })
    },
    [removeMutation]
  )

  // Calculate total price
  const total = useMemo(() => {
    if (!cartData || !Array.isArray(cartData)) return 0
    return cartData.reduce((total, item) => total + (item.pdfPrice || 0), 0)
  }, [cartData])

  // const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  // const igst = Math.round(subtotal * 0.18)
  // const total = subtotal + igst

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm()

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value
    setCountry(selectedCountry)
    setValue('state', '')
    setValue('customCountry', '')
  }

  const handleStateChange = (e) => {
    const seletedState = e.target.value
    setState(seletedState)
  }

  const onSubmit = (data) => {
    console.log(data)
    reset()
    setCountry('')
    alert('Order Placed Successfully!')
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading cart</p>
          <p className="text-gray-600">
            {error?.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    )
  }

  return (
    // <div className="min-h-screen bg-gray-50">

    <div className="w-full bg-slate-50 py-10 text-gray-600 font-aptos-regular">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.2)] p-2">
          {/* Billing Address Form */}
          <div className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-2xl font-aptos-bold text-gray-800 mb-6">
                Billing address
              </h2>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 rounded-lg shadow-[0_0_7px_rgba(0,0,0,0.2)] p-5"
              >
                {/* Name and Mobile in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 ">
                  <div>
                    <label className="block text-md font-aptos-regular text-gray-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      {...register('fullName', {
                        required: 'Name is required',
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-md font-aptos-regular text-gray-600 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      {...register('mobile', {
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Enter a valid 10-digit number',
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter mobile number"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country and State in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-md font-aptos-regular text-gray-600 mb-1">
                      Country
                    </label>
                    <select
                      {...register('country', {
                        required: 'Country is required',
                      })}
                      onChange={handleCountryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-md font-aptos-regular text-gray-600 mb-1">
                      {country === 'India'
                        ? 'State'
                        : country === 'Other'
                        ? 'Country Name'
                        : 'State'}
                    </label>
                    {country === 'India' ? (
                      <select
                        {...register('state', {
                          required: 'State is required',
                        })}
                        onChange={handleStateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state, index) => (
                          <option key={index} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    ) : country === 'Other' ? (
                      <input
                        type="text"
                        {...register('customCountry', {
                          required: 'Country name is required',
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter country name"
                      />
                    ) : (
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        placeholder="Select country first"
                      />
                    )}
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state.message}
                      </p>
                    )}
                    {errors.customCountry && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customCountry.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-md font-aptos-regular text-gray-600 mb-1 mt-5">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Pay Now Button */}
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-sm hover:bg-orange-600 text-white font-aptos-semibold py-3 px-4 rounded-md transition-colors duration-300 mt-6"
                >
                  PAY NOW
                </button>
              </form>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="p-6">
              {/* Cart Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-aptos-bold text-2xl text-orange-500">
                  Your cart
                </h3>
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-aptos-semibold">
                  {cartData.length}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartData.length > 0 &&
                  cartData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-around py-1.5 bg-white rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)]"
                    >
                      <p className="text-orange-500 font-semibold">
                        {item.title}
                      </p>

                      <div className="flex flex-col items-center">
                        <h4 className="font-aptos-bold text-gray-800">
                          {item.companyName}
                        </h4>{' '}
                        <p className="font-aptos-regular text-gray-600">
                          ₹{item.pdfPrice}/-
                        </p>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => handleRemove(item.id, item.title)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>

              {/* Divider */}
              <hr className="border border-[#ff7010] mb-4" />

              {/* Tax Info */}
              <div className="font-aptos-regular text-sm text-gray-600 mb-4">
                {state === 'Haryana'
                  ? '@ 9% CGST + 9% SGST Included'
                  : '@ 18% IGST Included'}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-orange-500">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  )
}

export default Checkout
