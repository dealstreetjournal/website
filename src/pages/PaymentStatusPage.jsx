import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useCart } from '../hooks/useCart'
import config from '../config'

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [orderType, setOrderType] = useState('cart')

  const { loadCartCount } = useCart()

  useEffect(() => {
    const orderId = searchParams.get('ORDER_ID') || searchParams.get('orderId')
    const type = searchParams.get('type') || 'cart'
    setOrderType(type)

    if (!orderId) {
      Swal.fire({
        title: 'Error',
        text: 'Invalid payment callback - Order ID not found',
        icon: 'error',
        confirmButtonColor: '#ff7010',
      }).then(() => navigate('/'))
      return
    }

    if (type === 'fi') {
      verifyFiPaymentStatus(orderId)
    } else {
      verifyPaymentStatus(orderId)
    }
  }, [searchParams, navigate])

  const verifyFiPaymentStatus = async (orderId) => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/fi/order/verify/${orderId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (!response.ok) throw new Error('Failed to verify payment')
      const data = await response.json()
      setStatus({ ...data, status: data.status === 'TXN_SUCCESS' ? 'TXN_SUCCESS' : data.status === 'TXN_FAILURE' ? 'TXN_FAILURE' : 'PENDING' })
      setLoading(false)
    } catch (error) {
      console.error('Error verifying FI payment:', error)
      setLoading(false)
      Swal.fire({
        title: 'Error',
        text: 'Failed to verify payment status. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#ff7010',
      }).then(() => navigate('/'))
    }
  }

  const verifyPaymentStatus = async (orderId) => {
    // console.log('🔄 Verifying payment for order:', orderId)

    try {
      const response = await fetch(
        `https://web.dealstreetjournal.com/dsj/payment/verify-status/${orderId}`,
        // `http://localhost:8081/dsj/payment/verify-status/${orderId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to verify payment')
      }

      const data = await response.json()
      // console.log('✅ Payment status:', data)

      setStatus(data)
      setLoading(false)

      // Show appropriate message
      if (data.status === 'TXN_SUCCESS') {
        loadCartCount()
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error)
      setLoading(false)

      Swal.fire({
        title: 'Error',
        text: 'Failed to verify payment status. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#ff7010',
      }).then(() => navigate('/'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Verifying Payment...
        </h2>
        <p className="text-gray-500 mt-2">
          Please wait while we confirm your transaction
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status?.status === 'TXN_SUCCESS' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              {status.message || 'Your transaction has been completed.'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Order ID: </span>
              {status?.orderId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Txn ID: </span>
              {status?.txnId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular mb-6">
              <span className="font-aptos-semibold">Amount: </span>₹
              {status?.amount || 'N/A'}
            </p>

            {orderType === 'fi' ? (
              <div>
                <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm mb-4">
                  Your reports are being generated and will be sent to your registered email shortly.
                </p>
                <Link
                  to="/smart-reports"
                  className="w-full block text-center bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
                >
                  Back to Smart Reports
                </Link>
              </div>
            ) : (
              <Link
                to="/user"
                state={{ query: 'report' }}
                className="w-full block text-center bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
              >
                Download Reports
              </Link>
            )}
          </div>
        )}

        {status?.status === 'TXN_FAILURE' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {status.message || 'Transaction could not be completed.'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Order ID: </span>
              {status?.orderId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Txn ID: </span>
              {status?.txnId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular mb-6">
              <span className="font-aptos-semibold">Amount: </span>₹
              {status?.amount || 'N/A'}
            </p>

            <Link
              to="/checkout"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
            >
              Try Again
            </Link>
          </div>
        )}

        {status?.status === 'PENDING' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-8 w-8 text-yellow-600 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-aptos-bold text-gray-900 mb-2">
              Payment Pending
            </h2>
            <p className="text-gray-600 font-aptos-semibold mb-6">
              {status?.message ||
                'Your payment is being processed. Please wait or refresh after sometime.'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Order ID: </span>
              {status?.orderId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular">
              <span className="font-aptos-semibold">Txn ID: </span>
              {status?.txnId || 'N/A'}
            </p>

            <p className="text-gray-600 font-aptos-regular mb-6">
              <span className="font-aptos-semibold">Amount: </span>₹
              {status?.amount || 'N/A'}
            </p>
            <Link
              to="/user"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentStatusPage
