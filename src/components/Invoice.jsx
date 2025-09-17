import React from 'react'
import { FiDownload } from 'react-icons/fi'

const Invoice = () => {
  document.title = 'Invoice | Dealstreetjournal'
  const data = [
    {
      date: '02 Aug 2025',
      invoice: '25083',
      details: [
        'Latest Deal (Seekho 3 December 2024)',
        'Funding 365 (Zomato 2020-21)',
        'Financial Insight (Astrotalk 2023-24 (Margin Analysis))',
        'Financial Insight (Astrotalk 2023-24 (Financial Statement))',
        'Financial Insight (Astrotalk 2020-21 (Employee Cost))',
      ],
    },
    {
      date: '02 Aug 2025',
      invoice: '25082',
      details: [
        'Latest Deal (Seekho 3 December 2024)',
        'Funding 365 (Zomato 2020-21)',
      ],
    },
    {
      date: '02 Aug 2025',
      invoice: '25081',
      details: ['Latest Deal (Seekho 3 December 2024)'],
    },
    {
      date: '02 Apr 2025',
      invoice: '25041',
      details: ['Latest Deal (Zomato 1 October 2024)'],
    },
  ]
  return (
    <>
      <div className="bg-white p-5 rounded-lg pt-8 shadow-[0_0_10px_rgba(0,0,0,0.2)] text-gray-800">
        <h2 className="text-2xl font-aptos-bold text-center mb-6">
          Purchase History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-[#ff7010] text-white text-center">
                <th className="px-4 py-3 font-aptos-semibold border border-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 font-aptos-semibold border whitespace-nowrap border-gray-300">
                  Invoice No
                </th>
                <th className="px-4 py-3 font-aptos-semibold border border-gray-300">
                  Details
                </th>
                <th className="px-4 py-3 font-aptos-semibold border border-gray-300 text-center">
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? 'bg-slate-200' : 'bg-white'
                  } hover:bg-slate-200`}
                >
                  <td className="px-4 py-3 align-top font-aptos-semibold border border-gray-300">
                    {row.date}
                  </td>
                  <td className="px-4 py-3 align-top font-aptos-semibold border border-gray-300">
                    {row.invoice}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    <ul className="list-none space-y-1">
                      {row.details.map((d, j) => (
                        <li key={j} className="font-aptos-regular">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center text-[#ff7010] cursor-pointer hover:text-orange-700">
                    <FiDownload size={20} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Invoice
