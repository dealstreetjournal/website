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
          alt="Blinkit Logo"
          className="w-15 h-15 rounded object-contain"
        />
        <h2 className="text-[#ff7010] text-xl md:text-base lg:text-xl whitespace-nowrap font-aptos-bold">
          {brandName}
        </h2>
      </div>

      <hr className="border-t-2 border-[#ff7010] w-full mb-7" />

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
            <p className="font-aptos-bold">{grossRevenue}</p>
          </div>
        </div>

        {/* EBITDA */}
        <div className="flex gap-2">
          <FaChartLine size={18} className="text-[#ff7010] mt-1 shrink-0" />
          <div>
            <p className="text-gray-500 font-aptos-regular">EBITDA</p>
            <p
              className={`${
                ebitda.charAt(0) === '+' ? 'text-green-700' : 'text-red-600'
              }  font-aptos-bold`}
            >
              &#x20b9;{ebitda.slice(1)}
            </p>
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
            <p
              className={` ${
                netProfitLoss.charAt(0) === '-'
                  ? 'text-red-600'
                  : 'text-green-700'
              } font-aptos-bold`}
            >
              ₹{netProfitLoss.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfileSection
