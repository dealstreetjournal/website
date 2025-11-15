// import React, { useState } from 'react'

// const SamplePdf = ({ url }) => {
//   const [showModal, setShowModal] = useState(false)
//   const [pdfSrc, setPdfSrc] = useState('')

//   const handlePreviewClick = (e) => {
//     e.preventDefault()
//     const src = e.currentTarget.getAttribute('data-src')
//     setPdfSrc(src)
//     setShowModal(true)
//   }

//   const handleCloseModal = () => {
//     setShowModal(false)
//     setPdfSrc('') // Clear PDF when modal closes
//   }

//   return (
//     <>
//       <div>
//         <a
//           href="#"
//           // className="pdf-preview text-white font-aptos-semibold bg-[#ff7010] px-3 py-2 rounded"
//           // data-src="https://dealstreetbucket.s3.amazonaws.com/reports/sample/1285336d-571c-40a3-a1ad-83b4763c0c49-ABC%20Company%20-%20XYZ%20Cap-%204%20June%202024%20.pdf"
//           data-src={url}
//           onClick={handlePreviewClick}
//         >
//           Sample
//         </a>
//       </div>

//       {/* PDF Preview Modal */}
//       {showModal && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//           onClick={handleCloseModal}
//         >
//           <div
//             className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <h5 className="text-xl font-aptos-semibold text-black">
//                 PDF Preview
//               </h5>
//               <button
//                 type="button"
//                 className="text-gray-400 hover:text-gray-600 text-2xl font-aptos-bold hover:rotate-90 transition-transform cursor-pointer"
//                 onClick={handleCloseModal}
//               >
//                 ×
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 p-4 overflow-hidden">
//               <iframe
//                 src={pdfSrc}
//                 className="w-full h-[600px] border-0"
//                 title="PDF Preview"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// export default SamplePdf

import React, { useState, useEffect } from 'react'

const SamplePdf = ({ url }) => {
  const [showModal, setShowModal] = useState(false)
  const [pdfSrc, setPdfSrc] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }
    checkMobile()
  }, [])

  const handlePreviewClick = (e) => {
    e.preventDefault()
    const src = e.currentTarget.getAttribute('data-src')
    setPdfSrc(src)

    // On mobile, open PDF in new tab instead of modal
    if (isMobile) {
      window.open(src, '_blank')
    } else {
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setPdfSrc('')
  }

  return (
    <>
      <div>
        <a
          href="#"
          data-src={url}
          onClick={handlePreviewClick}
          className="text-white font-semibold bg-[#ff7010] px-3 py-2 rounded inline-block"
        >
          {isMobile ? 'View PDF' : 'Sample'}
        </a>
      </div>

      {/* PDF Preview Modal - Desktop Only */}
      {!isMobile && showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-xl font-semibold text-black">PDF Preview</h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold hover:rotate-90 transition-transform cursor-pointer"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={pdfSrc}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
                tooltip="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SamplePdf
