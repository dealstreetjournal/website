import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import pdf from '../assets/pdf.svg'
import Pagination from '../components/Pagination'
import spinner from '../assets/spinner.png'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchLatestDeal } from '../api/dsjApi'
import { addToCart } from '../api/cartApi'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import Popup from '../components/Popup'

const LatestDeal = () => {
  document.title = 'Latest deal | DealStreetJournal'

  const [showPopup, setShowPopup] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const popup = sessionStorage.getItem('popupShown')
    if (!popup) {
      setShowPopup(true)
      sessionStorage.setItem('popupShown', 'true')
    }
  }, [])

  const location = useLocation()
  const { query, time } = location.state || {}

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounceSearch, setDebounceSearch] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query) {
      setSearch(query)
      setDebounceSearch(query)
    }
  }, [])

  const { incrementCartCount } = useCart()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(search)
      setPage(1)
    }, time || 2000)
    return () => clearTimeout(handler)
  }, [search])

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['latestdeal', page, debounceSearch],
    queryFn: () => fetchLatestDeal(page, debounceSearch),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const latestDeals = data?.latestDeals || []
  const totalPages = Math.ceil((data?.totalCount || 0) / 10)
  const pdfUrl = data?.samplePdf

  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      console.log('item added to cart :', data)
      incrementCartCount()
      Swal.fire({
        title: 'Success!',
        text: 'Item added to cart successfully',
        icon: 'success',
        confirmButtonText: 'Cart',
        confirmButtonColor: '#ff7010',
        showCancelButton: true,
        showCloseButton: true,
        timer: 3000,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart')
        }
      })
    },
    onError: (error) => {
      const res = error.response.data
      Swal.fire({
        title: 'Warning !',
        text: res,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
      })
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <>
      <div className="w-full bg-[#F8F9FA] py-5">
        <div className="max-w-6xl mx-auto w-[90%]">
          {/* popup */}
          {showPopup && <Popup onClose={() => setShowPopup(false)} />}

          {/* breadcrumb */}
          <div className="flex justify-between items-center">
            <div className="font-aptos-semibold flex justify-start">
              <Link
                to="/dsj-insight"
                className="text-black hover:text-slate-700 transition-all duration-300"
              >
                DSJ
              </Link>

              <Link
                to="/latest"
                className="text-[#ff7010] hover:text-[#cc5200] transition-all duration-300"
              >
                /Latest Deal
              </Link>
            </div>

            <div
              className="block md:hidden cursor-pointer bg-[#ff7010] font-aptos-semibold px-3 py-2 rounded text-white"
              onClick={() => setOpen(true)}
            >
              Sample
            </div>
          </div>
          {/* heading */}
          <div className="mt-8 border-2 border-slate-300 bg-slate-200 p-5 rounded-xl shadow-md text-center">
            <h2 className="font-aptos-bold text-2xl xl:text-3xl text-[#ff7010]">
              DSJ Latest Deal
            </h2>

            <div className="mx-auto h-[2px] bg-[#ff7010] mt-2 rounded-full animate-[growShrink_2s_ease-in-out_infinite]"></div>

            <p className="font-aptos-semibold text-base xl:text-xl text-gray-800 text-start mt-4">
              Stay Updated on every major fundraise. Access key metrics like
              valuation, share premium, and investor participation - all at one
              place.
            </p>
          </div>
          {/* search and sample report */}
          <div className="mt-10 flex justify-between items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Company Name..."
              className="border-2 rounded w-full sm:w-48 px-2 py-1 border-[#ff7010] focus:border-[#cc5c00] focus:ring-0 focus:outline-none"
            />

            <div
              className="hidden md:block cursor-pointer bg-[#ff7010] font-aptos-semibold px-3 py-2 rounded text-white"
              onClick={() => setOpen(true)}
            >
              Sample Report
            </div>
          </div>
          {open && (
            <div className="fixed inset-0  flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 relative">
                {/* Close Button (only tab/element) */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-11 cursor-pointer right-5 border-2 border-red-700 bg-white px-2 text-red-700 rounded-full hover:text-red-800 text-lg font-aptos-bold"
                >
                  ✕
                </button>

                {/* PDF Viewer */}
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="600"
                />
              </div>
            </div>
          )}
          {/* table for large device */}
          <div className="my-5 hidden md:block">
            <table className="min-w-full table-fixed">
              <thead className="font-aptos-regular">
                <tr className="bg-[#F67E07] text-white text-center">
                  <td className="p-3 whitespace-nowrap">S NO</td>
                  <td className="p-3">DATE</td>
                  <td className="p-3">COMPANY</td>
                  <td className="p-3 whitespace-nowrap">DETAILS OF FUNDING</td>
                  <td className="p-3">REPORT</td>
                  <td className="p-3">PRICE</td>
                  <td className="p-3">ACTION</td>
                </tr>
              </thead>
              <tbody>
                {latestDeals.map((row, idx) => {
                  const count = (page - 1) * 10 + 1
                  const date = new Date(row.fundingDate)
                  const formattedDate = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  row.fundingDate = formattedDate
                  return (
                    <tr
                      key={row.id}
                      className="odd:bg-white even:bg-slate-200 hover:bg-orange-50 transition duration-300"
                    >
                      <td className="p-3 font-aptos-semibold xl:font-aptos-bold text-center">
                        {count + idx}
                      </td>
                      <td className="p-3 font-aptos-semibold xl:font-aptos-bold whitespace-nowrap">
                        {row.fundingDate}
                      </td>
                      <td className="p-3">
                        <img
                          src={row.companyLogoUrl}
                          alt={row.companyName}
                          title={row.companyName}
                          loading="lazy"
                          className="w-22 h-20 object-contain"
                        />
                      </td>
                      <td className="p-3 w-[50%] text-gray-800 font-aptos-semibold xl:font-aptos-bold">
                        {row.fundingDetails}
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-22 h-20">
                          <img src={pdf} alt="pdf-image" />
                        </div>
                      </td>
                      <td className="p-3 text-center font-aptos-semibold xl:font-aptos-bold">
                        &#x20b9;{row.pdfPrice}
                      </td>

                      <td className="p-3 text-center">
                        <Tippy
                          content="Please carefully review the product before buying. You can view our sample reports to get better understanding of our products. We do not provide any kind of refund after purchase. Please refer terms of services Point No.10 to know more about our no refund policy."
                          placement="top"
                          arrow={true}
                        >
                          <button
                            onClick={() =>
                              mutation.mutate({
                                productId: row.id,
                                title: 'latest',
                              })
                            }
                            className="bg-gradient-to-r from-[#ff7010] to-[#cc5c00] cursor-pointer text-white rounded-full p-3 hover:scale-110 transition-all duration-300"
                          >
                            <FaShoppingCart size={20} />
                          </button>
                        </Tippy>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* card for small screen */}
          <div className="grid md:hidden gap-5 grid-cols-1 my-5">
            {latestDeals.map((row) => (
              <div
                key={row.id}
                className="bg-slate-200 rounded-md p-4 border border-slate-300"
              >
                {/* Image & Description */}
                <div className="min-h-[100px]">
                  <img
                    src={row.companyLogoUrl}
                    alt="logo"
                    className="w-24 h-24 object-cover rounded-sm mr-3 float-left flex-shrink-0"
                  />
                  <p className="text-gray-800 font-aptos-semibold text-sm">
                    {row.fundingDetails}
                  </p>
                </div>

                <div className="border border-slate-300 my-2"></div>

                {/* Price & Funding Date */}
                <div className="flex justify-between items-center mt-4 font-aptos-semibold">
                  <div>
                    <p className="text-gray-700">Price</p>
                    <p className="text-[#ff7010] font-aptos-bold">
                      &#x20b9;{row.pdfPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700">Funding Date</p>
                    <p className="font-aptos-bold">{row.fundingDate}</p>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Tippy
                  content="Please carefully review the product before buying. You can view our sample reports to get better understanding of our products. We do not provide any kind of refund after purchase. Please refer terms of services Point No.10 to know more about our no refund policy."
                  placement="top"
                  arrow={true}
                >
                  <button
                    onClick={() =>
                      mutation.mutate({
                        productId: row.id,
                        title: 'latest',
                      })
                    }
                    className="mt-4 w-full bg-gradient-to-r from-[#ff7010] to-[#a95000] text-white py-2 rounded-full font-semibold hover:scale-[1.02] transition"
                  >
                    Add To Cart
                  </button>
                </Tippy>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center">
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  )
}

export default LatestDeal
