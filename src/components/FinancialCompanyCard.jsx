import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addToCart } from '../api/cartApi'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

const FinancialCompanyCard = ({ report, samplePdf }) => {
  const [open, setOpen] = useState(false)
  const { incrementCartCount } = useCart()

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      console.log('item added to cart :', data)
      incrementCartCount()
      Swal.fire({
        title: 'Success!',
        text: 'Item added to cart successfully',
        icon: 'success',
        confirmButtonText: 'Cart',
        confirmButtonColor: '#ff7010',
        showCancelButton: true,
        showCloseButton: true,
        timer: 3000,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart')
        }
      })
    },
    onError: (error) => {
      const res = error.response.data
      Swal.fire({
        title: 'Warning !',
        text: res,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
      })
    },
  })

  return (
    <>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 relative">
            {/* Close Button (only tab/element) */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-11 cursor-pointer right-5 border-2 border-red-700 bg-white px-2 text-red-700 rounded-full hover:text-red-800 text-lg font-aptos-bold"
            >
              ✕
            </button>

            {/* PDF Viewer */}
            <embed
              src={samplePdf}
              type="application/pdf"
              width="100%"
              height="600"
            />
          </div>
        </div>
      )}
      <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-5 mt-10 text-center hover:border border-black hover:-translate-y-2 transition-transform duration-300 h-[250px]">
        <h4 className="font-aptos-bold text-lg">{report.reportTitle}</h4>
        <p className="text-gray-500 font-aptos-regular">{report.reportDesc}</p>
        <span className="font-aptos-semibold text-[#ff7010]">
          &#x20B9;{report.reportPrice}
        </span>
        <div className="flex justify-around items-center gap-3 ">
          <Tippy
            content="Please carefully review the product before buying. You can view our sample reports to get better understanding of our products. We do not provide any kind of refund after purchase. Please refer terms of services Point No.10 to know more about our no refund policy."
            placement="top"
            arrow={true}
          >
            <button
              onClick={() =>
                mutation.mutate({
                  productId: report.id,
                  title: 'financial',
                })
              }
              className="border-2 border-[#ff7010] cursor-pointer bg-[#ff7010] text-white px-2 py-1.5 rounded font-aptos-semibold"
            >
              Add to Cart
            </button>
          </Tippy>
          {samplePdf && (
            <div
              onClick={() => setOpen(true)}
              className="border-2 cursor-pointer border-[#ff7010] px-4 py-1.5 rounded font-aptos-regular"
            >
              Sample
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default FinancialCompanyCard
