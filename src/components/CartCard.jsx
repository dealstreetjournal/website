import React from 'react'
import { MdDelete } from 'react-icons/md'

const CartCard = ({ data, onRemove }) => {
  const handleRemove = (productId, title) => {
    if (onRemove) {
      onRemove(productId, title)
    }
  }

  return (
    <>
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {data && data.length > 0 ? (
          data.map((d, idx) => (
            <div
              key={idx}
              className="rounded-lg w-full min-h-[450px] bg-slate-200 p-5 border border-gray-400 hover:border-black hover:-translate-y-2 transition-transform duration-300"
            >
              <img
                src={d.companyLogoUrl}
                alt={d.companyName || 'Company Logo'}
                className="w-40 h-40 rounded object-cover mx-auto"
              />

              <div className="mt-5">
                {d.financialTitle && (
                  <h1 className="font-aptos-bold text-lg">
                    {d.financialTitle}
                  </h1>
                )}
                <p className="text-gray-600 font-aptos-regular text-sm line-clamp-3">
                  {d.details}
                </p>
              </div>

              <div className="border border-slate-300 my-3"></div>

              <div className="flex justify-between items-center font-aptos-semibold">
                <h5 className="text-gray-800 text-sm">{d.title}</h5>
                <p className="text-[#e66000] font-bold">&#x20B9;{d.pdfPrice}</p>
              </div>

              <div className="flex justify-between items-center mt-2 font-aptos-semibold">
                <p className="text-gray-500 text-sm">{d.date}</p>
                <MdDelete
                  className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                  size={20}
                  onClick={() => handleRemove(d.id, d.title)}
                  title="Remove from cart"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-xl mb-4">Your cart is empty</p>
          </div>
        )}
      </div>
    </>
  )
}

export default CartCard
