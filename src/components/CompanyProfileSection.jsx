import React from 'react'
import {
  FaBuilding,
  FaCalendarAlt,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaHandHoldingUsd,
} from 'react-icons/fa'

const CompanyProfileSection = ({
  brandName,
  companyLogoUrl,
  companyName,
  ebitda,
  grossRevenue,
  industry,
  netProfitLoss,
  yearIncorporation,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-slate-100 border border-gray-200 rounded-lg shadow p-5">
      {/* Header */}
      <div className="flex items-end gap-4 mb-1">
        <img
          src={companyLogoUrl}
          alt={brandName}
          loading="lazy"
          className="w-15 aspect-square object-contain object-center rounded border-2 border-slate-300"
        />
        <h2 className="text-[#e66000] text-xl md:text-base lg:text-xl whitespace-wrap font-aptos-bold">
          {brandName}
        </h2>
      </div>

      <hr className="text-[#ff7010] w-full my-3" />

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6 text-sm">
        {/* Company Name */}
        <div className="flex gap-2">
          <FaBuilding size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">Company Name</p>
            <p className="font-aptos-bold">{companyName}</p>
          </div>
        </div>

        {/* Incorporation Year */}
        <div className="flex gap-2">
          <FaCalendarAlt size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">
              Incorporation Year
            </p>
            <p className="font-aptos-bold">{yearIncorporation}</p>
          </div>
        </div>

        {/* Industry */}
        <div className="flex gap-2">
          <FaShoppingCart size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">Industry</p>
            <p className="font-aptos-bold">{industry}</p>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="flex gap-2">
          <FaMoneyBillWave size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">Gross Revenue</p>
            {/* {console.log('grossRevenue', grossRevenue)} */}
            {grossRevenue &&
              (() => {
                {
                  /* const start = grossRevenue.indexOf('(')
                const end = grossRevenue.indexOf(')')

                // Main value (before parentheses)
                const value = grossRevenue.slice(0, start).trim()
                // Year with parentheses
                const year = grossRevenue.slice(start, end + 1) */
                }

                const [value, year] = grossRevenue.split('(')

                return (
                  <>
                    <p className="font-aptos-bold">{value}</p>
                    {year && <p className="font-aptos-bold">{`(${year}`}</p>}
                  </>
                )
              })()}
          </div>
        </div>

        {/* EBITDA */}
        <div className="flex gap-2">
          <FaChartLine size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">EBITDA</p>

            {ebitda &&
              (() => {
                const start = ebitda.indexOf('(')
                const end = ebitda.indexOf(')')

                // Main value (before parentheses)
                const value = ebitda.slice(0, start).trim()
                // Year with parentheses
                const year = ebitda.slice(start, end + 1)

                return (
                  <>
                    <p
                      className={`${
                        ebitda.charAt(0) === '+'
                          ? 'text-green-700'
                          : 'text-red-600'
                      }  font-aptos-bold`}
                    >
                      {value.charAt(0) === '+' ? value.slice(1) : value}
                    </p>
                    <p className="font-aptos-bold">{year}</p>
                  </>
                )
              })()}
          </div>
        </div>

        {/* Net Profit */}
        <div className="flex gap-2">
          <FaHandHoldingUsd
            size={20}
            className="text-[#ff7010] mt-1 shrink-0"
          />
          <div>
            <p className="text-gray-500 font-aptos-regular">
              Net Profit/(Loss)
            </p>
            {netProfitLoss &&
              (() => {
                const start = netProfitLoss.indexOf('(')
                const end = netProfitLoss.indexOf(')')

                // Main value (before parentheses)
                const value = netProfitLoss.slice(0, start).trim()
                // Year with parentheses
                const year = netProfitLoss.slice(start, end + 1)

                return (
                  <>
                    <p
                      className={`${
                        netProfitLoss.charAt(0) === '+'
                          ? 'text-green-700'
                          : 'text-red-600'
                      }  font-aptos-bold`}
                    >
                      {value.charAt(0) === '+' ? value.slice(1) : value}
                    </p>
                    <p className="font-aptos-bold">{year}</p>
                  </>
                )
              })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfileSection
