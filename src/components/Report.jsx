import React, { useMemo, useState } from 'react'
import { getReport } from '../api/userApi'
import { useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { handleDate } from '../handleDate'
import { FiDownload } from 'react-icons/fi'
import { FaMinus } from 'react-icons/fa6'
import Pagination from './Pagination'

const Report = () => {
  document.title = 'Report | Dealstreetjournal'
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['report', page],
    queryFn: ()=> getReport(page),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const totalPages = useMemo(() => {
    return Math.ceil((data?.totalCount || 0) / 5)
  }, [data?.totalCount])

  const handleDownload = (fileUrl, fileName, insight) => {
    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName + ' ' + insight || 'download'
        link.click()
        window.URL.revokeObjectURL(link.href)
      })
      .catch((err) => console.error('Download failed:', err))
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)] text-gray-800">
      <h2 className="text-2xl sm:text-3xl font-aptos-bold text-center mb-6 sm:mb-8 text-[#ff7010]">
        Download Report
      </h2>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-[#ff7010] text-white text-center">
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Date
              </th>
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Order Id
              </th>
              <th className="px-4 py-3 font-aptos-semibold border-r border-[#ffa45a]">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.reports?.map((row, i) => (
              <tr
                key={i}
                className={`transition-all duration-200 ${
                  i % 2 === 0 ? 'bg-slate-100' : 'bg-white'
                } hover:bg-orange-50`}
              >
                <td className="px-4 py-4 align-top font-aptos-semibold border-t border-gray-200 text-center">
                  {handleDate(row.date)}
                </td>

                <td className="px-4 py-4 align-top font-aptos-semibold border-t border-gray-200 text-center text-[#333]">
                  {row.orderId}
                </td>

                <td className="px-4 py-4 border-t border-gray-200">
                  <ul className="list-none space-y-1">
                    {row.products?.map((d, j) => (
                      <li
                        key={j}
                        className="flex items-center justify-between text-sm text-gray-700"
                      >
                        <div className="flex flex-wrap items-center gap-2">
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
                        </div>

                        <span
                          onClick={() =>
                            handleDownload(d.report, d.productName, d.insight)
                          }
                          className="flex items-center justify-center cursor-pointer w-10 h-10 rounded-full hover:bg-[#ff7010]/10 text-[#ff7010] hover:text-[#e65c00] transition"
                        >
                          <FiDownload size={20} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {data?.reports?.map((row, i) => (
          <div
            key={i}
            className="bg-slate-100 rounded-lg border border-slate-400 shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-[#ff7010] text-white px-4 py-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="font-aptos-semibold text-sm">
                  orderId: {row.orderId}
                </div>
                <div className="font-aptos-regular text-sm">
                  {handleDate(row.date)}
                </div>
              </div>
            </div>

            {/* Card Body - Products */}
            <div className="p-4 space-y-3">
              {row.products?.map((d, j) => (
                <div
                  key={j}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                >
                  {/* Product Date */}
                  <div className="text-xs text-gray-500 font-aptos-regular mb-2">
                    {handleDate(d.date) === 'Invalid Date'
                      ? d.date
                      : handleDate(d.date)}
                  </div>

                  {/* Product Name & Insight */}
                  <div className="font-aptos-semibold text-gray-800 mb-2 text-sm">
                    {d.productName}
                  </div>
                  <div className="text-sm text-gray-600 font-aptos-semibold mb-3">
                    ({d.insight})
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() =>
                      handleDownload(d.report, d.productName, d.insight)
                    }
                    className="w-fit mx-auto cursor-pointer bg-orange-500/80 hover:bg-[#e65c00] text-white font-aptos-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <FiDownload size={18} />
                    <span>Download Report</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data?.reports?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="font-aptos-semibold text-lg">No reports available</p>
        </div>
      )}

      <div className="flex justify-center items-center mt-5">
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  )
}

export default Report
