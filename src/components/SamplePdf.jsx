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
        <a href="#" data-src={url} onClick={handlePreviewClick}>
          Sample Report
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
                src={`${pdfSrc}#toolbar=0`}
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
