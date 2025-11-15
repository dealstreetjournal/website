import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { FiDownload } from 'react-icons/fi'
import { FaMinus } from 'react-icons/fa6'
import { getInvoice } from '../api/userApi'
import spinner from '../assets/spinner.png'
import { handleDate } from '../handleDate'
import CreatePdf from './CreatePdf'
import { Link } from 'react-router-dom'

const Invoice = () => {
  document.title = 'Invoice | Dealstreetjournal'

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['invoice'],
    queryFn: getInvoice,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const sortData = data ? [...data].sort((a, b) => b.id - a.id) : []

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
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)] text-gray-800">
      <h2 className="text-3xl font-aptos-bold text-center mb-8 text-[#ff7010]">
        Purchase History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-[#ff7010] text-white text-center">
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Date
              </th>
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Invoice No
              </th>
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Details
              </th>
              <th className="px-4 py-3 font-aptos-semibold text-center">
                Download
              </th>
            </tr>
          </thead>

          <tbody>
            {sortData.map((row, i) => (
              <tr
                key={i}
                className={`transition-all duration-200 ${
                  i % 2 === 0 ? 'bg-slate-100' : 'bg-white'
                } hover:bg-orange-50`}
              >
                {/* Date */}
                <td className="px-4 py-4 align-top font-aptos-semibold border-t border-gray-200 text-center">
                  {handleDate(row.date)}
                </td>

                {/* Invoice No */}
                <td className="px-4 py-4 align-top font-aptos-semibold border-t border-gray-200 text-center text-[#333]">
                  #{row.invoice}
                </td>

                {/* Details */}
                <td className="px-4 py-4 border-t border-gray-200">
                  <ul className="list-none space-y-2">
                    {row.products.map((d, j) => (
                      <li
                        key={j}
                        className="flex flex-wrap items-center gap-2 text-sm text-gray-700"
                      >
                        <span className="text-gray-600 font-aptos-regular">
                          {handleDate(d.date) === 'Invalid Date'
                            ? d.date
                            : handleDate(d.date)}
                        </span>

                        <FaMinus className="text-gray-400 text-xs" />

                        <span className="font-aptos-semibold text-gray-800">
                          {d.productName}
                        </span>

                        <span className="font-aptos-semibold text-gray-800">
                          ({d.insight})
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>

                {/* Download */}
                <td className="px-4 py-4 border-t border-gray-200 text-center">
                  <Link
                    to="/invoice"
                    state={{
                      invoice: row.invoice,
                      products: row.products,
                      name: row.name,
                      amount: row.amount,
                      country: row.country,
                      email: row.email,
                      orderId: row.orderId,
                      phone: row.phone,
                      state: row.state,
                    }}
                    className="flex items-center cursor-pointer justify-center mx-auto w-10 h-10 rounded-full hover:bg-[#ff7010]/10 text-[#ff7010] hover:text-[#e65c00] transition"
                    title="Download Invoice"
                  >
                    <FiDownload size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Invoice
