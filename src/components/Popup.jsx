import React from 'react'

const Popup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 z-50">
      <div className="bg-slate-300 rounded-xl shadow-lg w-[500px] max-w-[90%] relative border-2 border-orange-500">
        {/* Header */}
        <div className="bg-[#ff7010] text-white p-3 rounded-t-xl flex justify-between items-center">
          <h2 className="font-aptos-bold text-xl">
            Data Integrity & Authenticity
          </h2>
          <button
            onClick={onClose}
            className="text-white text-[30px] cursor-pointer text-xl font-aptos-bold hover:text-gray-200 hover:rotate-90 transition-all duration-300"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-gray-800">
          <h3 className="text-center text-lg font-aptos-bold mb-3">
            !! Attention !!
          </h3>
          <p className="text-base font-aptos-regular leading-relaxed">
            Kindly note that all reports have been prepared based on the
            company’s data, sourced directly from various regulatory filings.
            Each report is the result of a comprehensive review and a diligent,
            methodical process.{' '}
            <span className="font-aptos-bold">
              THESE REPORTS ARE NOT DERIVED FROM EXTERNAL TEMPLATES OR
              COPY-PASTE METHODS.
            </span>{' '}
            Our team has made a sincere and concerted effort to present
            original, organically sourced data in an accurate, transparent, and
            reliable manner.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Popup
