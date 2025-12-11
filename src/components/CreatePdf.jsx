import React from 'react'
import html2pdf from 'html2pdf.js'
import logo from '../assets/logo.png'
import sign from '../assets/redlionSign.jpeg'
import './invoice.css'
import { useLocation } from 'react-router-dom'
import { handleDate } from '../handleDate'
import { stateCodes } from './stateCodes'

const CreatePdf = () => {
  // const date = new Date()
  const { state } = useLocation()

  const code = stateCodes[state.state]

  // Calculate total amount
  const totalAmount = state?.products?.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  )

  const gstAmount = state?.products?.reduce(
    (sum, product) => sum + (product.price / 118) * 18 || 0,
    0
  )

  const subTotal = state?.products?.reduce(
    (sum, product) => sum + (product.price - (product.price / 118) * 18),
    0
  )

  const handleDownload = () => {
    const element = document.getElementById('invoice')
    const opt = {
      margin: 0.5,
      filename: 'invoice.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="container my-5">
      <div id="invoice" className="invoice-box">
        <img src={logo} loading="lazy" className="logo" alt="Company Logo" />
        <h1 className="invoice-title">Tax Invoice</h1>

        <div style={{ fontSize: '18px' }}>
          <p>
            <span>Invoice Date: </span>
            <span>{handleDate(state?.date)}</span>
          </p>
          <p>
            <span>Invoice No: </span>
            <span>{state?.invoice}</span>
          </p>
        </div>

        <h1 className="bill">Bill To:</h1>

        <div className="address">
          <div className="userAddress">
            <p style={{ fontWeight: '500' }}>{state?.name}</p>
            <p>Order: {state?.orderId}</p>
            <p>Mobile: {state?.phone}</p>
            <p>Email: {state?.email}</p>
            <p>
              {state?.state}, {state?.country}
            </p>
          </div>

          <div className="companyAddress">
            <p style={{ fontWeight: '500' }}>
              Red Lion Technologies Private Limited
            </p>
            <p>Basement, 7415, DLF City Phase 4,</p>
            <p>Gurugram - 122009</p>
            <p>Haryana, India</p>
            <p>GSTIN - 06AANCR9570Q1ZA</p>
          </div>
        </div>

        <div className="tableHeading">
          <p>Place of supply UT/state code: {code}</p>
          <p>HSN code - 998431</p>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Details of purchase</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Total Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {state?.products?.map((product, index) => (
              <tr key={index}>
                <td>{index + 1}</td>

                <td style={{ textAlign: 'left' }}>
                  {product.productName} - ({product.insight}) -
                  <span style={{ color: 'gray' }}>
                    {handleDate(product.date) === 'Invalid Date'
                      ? ' FY ' + product.date
                      : handleDate(product.date)}
                  </span>{' '}
                </td>

                <td>1</td>

                <td>
                  {(product.price - (product.price / 118) * 18).toFixed(2)}
                </td>

                <td>
                  {(product.price - (product.price / 118) * 18).toFixed(2)} /-
                </td>
              </tr>
            ))}

            {/* Subtotal Row */}
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: '500' }}>
                Sub Total (₹)
              </td>
              <td style={{ fontWeight: '500' }}>{subTotal.toFixed(2)} /-</td>
            </tr>

            {/* gst Row */}
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: '500' }}>
                {state.state.toLowerCase() === 'haryana'
                  ? 'CGST @ 9% + SGST @ 9%'
                  : 'IGST @ 18%'}
              </td>
              <td style={{ fontWeight: '500' }}>{gstAmount.toFixed(2)} /-</td>
            </tr>

            {/* total amount Row */}
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: '500' }}>
                Total Amount
              </td>
              <td style={{ fontWeight: '500' }}>
                {totalAmount.toLocaleString()} /-
              </td>
            </tr>
          </tbody>
        </table>

        <hr className="hr" />

        <div className="discalimar">
          <p>
            - Your purchase is subject to our terms and condition as mentioned
            in the terms of services on our website{' '}
            <a href="www.dealstreetjournal.com">www.dealstreetjournal.com</a>.
          </p>
          <p>
            - For any support or resolution of any issues, kindly contact on{' '}
            <a href="mailto:support@dealstreetjournal.com">
              support@dealstreetjournal.com
            </a>
            .
          </p>
        </div>

        <div>
          <p style={{ paddingBottom: '6px' }}>Thank you</p>
          <img src={sign} loading="lazy" className="sign" alt="Sign" />
          <p>Authorised Signatory</p>
          <p>Red Lion Technologies Private Limited</p>
          <p style={{ paddingBottom: '2px', marginBottom: '2px' }}>
            Registered address: 409, World Trade Center, Babar Road, Connaught
            Place, Delhi - 110001
          </p>
        </div>
      </div>

      <button onClick={handleDownload} className="download-btn">
        Download PDF
      </button>
    </div>
  )
}

export default CreatePdf
