import React, { useCallback, useMemo } from 'react'
import CartCard from '../components/CartCard'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import spinner from '../assets/spinner.png'
import { fetchCart, removeFromCart } from '../api/cartApi'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'
import { MdDelete } from 'react-icons/md'
import { MdOutlineRemoveShoppingCart } from 'react-icons/md'

const Cart = () => {
  document.title = 'Cart | DealStreetjournal'
  const queryClient = useQueryClient()

  const { decrementCartCount } = useCart()

  const { isPending, isError, data, error } = useQuery({
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
  const totalPrice = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0
    return data.reduce((total, item) => total + (item.pdfPrice || 0), 0)
  }, [data])

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

  const cartData = Array.isArray(data) ? data : []

  return (
    <>
      <div className="bg-[#F8F9FA] w-full mx-auto min-h-screen pb-20">
        <div className="max-w-6xl w-[90%] lg:w-[90%] mx-auto py-5">
          <h1 className="font-aptos-bold text-2xl sm:text-3xl text-[#e66000] mt-5 mb-10">
            Your Cart ({cartData.length}{' '}
            {cartData.length === 1 ? 'item' : 'items'})
          </h1>

          <CartCard data={cartData} onRemove={handleRemove} />

          {/* card for small screen */}
          <div className="grid md:hidden gap-5 grid-cols-1 my-5 w-[90%] mx-auto">
            {cartData.map((row, index) => (
              <div key={index} className="bg-slate-200 rounded-md p-4 shadow">
                {/* Image & Description */}
                <div className="min-h-[100px]">
                  <img
                    src={row.companyLogoUrl}
                    alt={row.companyName}
                    loading="lazy"
                    className="w-24 h-24 object-contain rounded-sm mr-3 float-left flex-shrink-0"
                  />

                  {row.financialTitle && (
                    <h1 className="font-aptos-bold text-md">
                      {row.financialTitle}
                    </h1>
                  )}
                  <p className="text-gray-600 font-aptos-regular text-sm line-clamp-3">
                    {row.details}
                  </p>
                </div>

                <hr className="text-slate-300 my-3" />

                {/* Price & Date */}
                <div className="flex-col justify-between items-center mt-4 font-aptos-semibold">
                  <div className="flex justify-between items-center font-aptos-semibold">
                    <h5 className="text-gray-800 text-sm">{row.title}</h5>
                    <p className="text-[#e66000] font-bold">
                      &#x20B9;{row.pdfPrice}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2 font-aptos-semibold">
                    <p className="text-gray-500 text-sm">{row.date}</p>
                    <MdDelete
                      className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                      size={20}
                      onClick={() => handleRemove(row.id, row.title)}
                      title="Remove from cart"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cartData.length > 0 && (
            <>
              <div className="my-8 w-[90%] mx-auto">
                <p className="text-right font-aptos-bold text-[#e66000] text-3xl">
                  <span className="text-[#6C757D]">Total:</span> &#x20B9;
                  {totalPrice.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end items-center sm:mt-10 gap-4 font-aptos-semibold text-white">
                <Link
                  to="/dsj-insight"
                  className="flex justify-start items-center gap-4 py-2 px-4 bg-white text-[#e66000] border-2 border-[#e66000] rounded hover:bg-[#cc5500] hover:border-[#cc5500] hover:text-white transition-colors"
                >
                  <FaArrowLeft /> Continue Shopping
                </Link>
                <Link
                  to="/checkout"
                  className="flex justify-between items-center gap-4 py-2 px-3 bg-[#e66000] border-2 border-[#e66000] rounded hover:bg-[#cc5500] hover:border-[#cc5500] transition-colors"
                >
                  Proceed To Checkout <FaArrowRight />
                </Link>
              </div>
            </>
          )}

          {cartData.length === 0 && (
            <div className="text-center flex flex-col justify-center items-center gap-6">
              <div className="text-gray-500 sm:hidden">
                <MdOutlineRemoveShoppingCart size={150} />
              </div>
              <Link
                to="/dsj-insight"
                className="inline-block py-3 px-6 bg-[#e66000] text-white rounded hover:bg-[#cc5500] transition-colors font-aptos-semibold"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart
