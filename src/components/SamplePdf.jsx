import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const SamplePdf = () => {
  useEffect(() => {
    // Select all links with pdf-preview class
    const pdfLinks = document.querySelectorAll('.pdf-preview')

    const handlePdfClick = (event) => {
      event.preventDefault()
      const pdfSrc = event.currentTarget.getAttribute('data-src')
      document.getElementById('modalPdfFrame').setAttribute('src', pdfSrc)
    }

    pdfLinks.forEach((link) => link.addEventListener('click', handlePdfClick))

    // Clear PDF on modal close
    const modal = document.getElementById('pdfPreviewModal')
    const clearPdf = () => {
      document.getElementById('modalPdfFrame').setAttribute('src', '')
    }
    modal.addEventListener('hidden.bs.modal', clearPdf)

    // Cleanup listeners when component unmounts
    return () => {
      pdfLinks.forEach((link) =>
        link.removeEventListener('click', handlePdfClick)
      )
      modal.removeEventListener('hidden.bs.modal', clearPdf)
    }
  }, [])

  return (
    <>
      {/* PDF Link */}
      <div className="text-center my-4">
        <a
          href="#"
          className="pdf-preview text-primary fw-bold"
          data-src="https://dealstreetbucket.s3.amazonaws.com/reports/sample/1285336d-571c-40a3-a1ad-83b4763c0c49-ABC%20Company%20-%20XYZ%20Cap-%204%20June%202024%20.pdf"
          data-bs-toggle="modal"
          data-bs-target="#pdfPreviewModal"
        >
          View Sample PDF
        </a>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="pdfPreviewModal"
        tabIndex="-1"
        aria-labelledby="pdfPreviewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="pdfPreviewModalLabel">
                PDF Preview
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-0">
              {/* PDF Viewer */}
              <iframe
                id="modalPdfFrame"
                title="PDF Preview"
                className="w-100 border-0"
                style={{ height: '85vh' }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SamplePdf
