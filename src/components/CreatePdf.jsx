import React from 'react'
import html2pdf from 'html2pdf.js'
import logo from '../assets/logo.png'
import './invoice.css'
import { useLocation } from 'react-router-dom'
import { handleDate } from '../handleDate'
import { stateCodes } from './stateCodes'

const CreatePdf = () => {
  const date = new Date()
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
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="container">
      <div id="invoice" className="invoice-box">
        <img src={logo} className="logo" alt="Company Logo" />
        <h1 className="invoice-title">Tax Invoice</h1>

        <div style={{ fontSize: '18px' }}>
          <p>
            <span>Invoice Date: </span>
            <span>{handleDate(date)}</span>
          </p>
          <p>
            <span>Invoice No: </span>
            <span>{state?.invoice}</span>
          </p>
        </div>

        <h1 className="bill">Bill To:</h1>

        <div className="address">
          <div className="userAddress">
            <p style={{ fontWeight: 'bold' }}>{state?.name}</p>
            <p>Order: {state?.orderId}</p>
            <p>Mobile: {state?.phone}</p>
            <p>Email: {state?.email}</p>
            <p>
              {state?.state}, {state?.country}
            </p>
          </div>

          <div className="companyAddress">
            <p style={{ fontWeight: 'bold' }}>
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
              <td
                colSpan="4"
                style={{ textAlign: 'right', fontWeight: 'bold' }}
              >
                Sub Total (₹)
              </td>
              <td style={{ fontWeight: 'bold' }}>{subTotal.toFixed(2)} /-</td>
            </tr>

            {/* gst Row */}
            <tr>
              <td
                colSpan="4"
                style={{ textAlign: 'right', fontWeight: 'bold' }}
              >
                {state.state.toLowerCase() === 'haryana'
                  ? 'CGST @ 9% + SGST @ 9%'
                  : 'IGST @ 18%'}
              </td>
              <td style={{ fontWeight: 'bold' }}>{gstAmount.toFixed(2)} /-</td>
            </tr>

            {/* total amount Row */}
            <tr>
              <td
                colSpan="4"
                style={{ textAlign: 'right', fontWeight: 'bold' }}
              >
                Total Amount
              </td>
              <td style={{ fontWeight: 'bold' }}>{totalAmount} /-</td>
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
            - For any support or resolution of any kindly contact on{' '}
            <a href="mailto:support@dealstreetjournal.com">
              support@dealstreetjournal.com
            </a>
            .
          </p>
        </div>

        <div>
          <p>Thank you</p>
          <p>Red Lion Technologies Private Limited</p>
          <p>
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
