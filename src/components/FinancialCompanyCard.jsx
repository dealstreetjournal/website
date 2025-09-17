import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../api/cartApi'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

const FinancialCompanyCard = ({ report }) => {
  const { incrementCartCount } = useCart()

  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      console.log('item added to cart :', data)
      incrementCartCount()
      Swal.fire({
        title: 'Success!',
        text: 'Item added to cart successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
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
          <Link className="border-2 border-[#ff7010] px-4 py-1.5 rounded font-aptos-regular">
            Sample
          </Link>
        </div>
      </div>
    </>
  )
}

export default FinancialCompanyCard
