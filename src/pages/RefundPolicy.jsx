import React from 'react'
import { Link } from 'react-router-dom'

const RefundPolicy = () => {
  document.title = 'Refund Policy'
  return (
    <>
      <div className="w-full bg-slate-50">
        <div className="max-w-6xl mx-auto w-[90%] py-8">
          <h1 className="font-aptos-bold text-3xl text-[#ff7010] mb-5">
            Refund Policy
          </h1>
          <p className="font-aptos-regular text-base">
            At <b>DealStreetJournal.com</b>, we strive to provide accurate and
            valuable reports to our customers. Before making a purchase, please
            carefully review the product details, as we do not offer refunds on
            any purchased reports under any circumstances.
            <br />
            <br />
            <b>No Refund Policy</b>
            <br />
            - Once a report is purchased and payment is successfully processed,
            it will be delivered to the email address provided during checkout.
            <br />- Due to the digital nature of our reports, all sales are{' '}
            <b>final and non-refundable</b>.<br />
            - We do not process cancellations, returns, or exchanges after the
            purchase is completed.
            <br />
            <br />
            <b>Non-Delivery Issues</b>
            <br />
            If you do not receive your report within the specified time after
            payment, please check your <b>spam/junk folder</b>. You can also{' '}
            <b>download the report from your account section</b>. If the issue
            persists, contact our support team at{' '}
            <b>support@dealstreetjournal.com</b>, and we will assist in
            resolving the issue.
            <br />
            <br />
            By purchasing a report on <b>DealStreetJournal.com</b>, you
            acknowledge and agree to this refund policy.
            <br />
            For any queries, feel free to reach&nbsp;out&nbsp;to&nbsp;us.
            <br />
            <br />
          </p>
        </div>
      </div>
    </>
  )
}

export default RefundPolicy
