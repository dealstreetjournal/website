import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import pdf from '../assets/pdf.svg'
import Pagination from '../components/Pagination'
import { fetchFundingCompanyDetails } from '../api/dsjApi'
import { useMutation, useQuery } from '@tanstack/react-query'
import spinner from '../assets/spinner.png'
import { addToCart } from '../api/cartApi'
import { useCart } from '../hooks/useCart'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import Popup from '../components/Popup'

const Funding365Company = () => {
  const location = useLocation()
  const { companyName } = location.state || {}
  document.title = `${companyName} | DealStreetJournal`

  const { id } = useParams()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const popup = sessionStorage.getItem('popupShown')
    if (!popup) {
      setShowPopup(true)
      sessionStorage.setItem('popupShown', 'true')
    }
  }, [])

  const { incrementCartCount } = useCart()

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['fundingCompany', id, page],
    queryFn: () => fetchFundingCompanyDetails(id, page),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const contents = data?.funding || []
  const totalPages = Math.ceil((data?.totalCount || 0) / 10)
  const pdfUrl = data?.samplePdf

  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      console.log('item added to cart :', data)
      incrementCartCount()
      Swal.fire({
        title: 'Success!',
        text: 'Item added to cart successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7010',
        timer: 3000,
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
    <div className=" bg-slate-50 pb-5 w-full mx-auto">
      <div className="bg-gray-200 h-48">
        <div className="max-w-6xl mx-auto h-full"></div>
      </div>
      <div className="max-w-6xl mx-auto w-[90%]">
        {/* popup */}
        {showPopup && <Popup onClose={() => setShowPopup(false)} />}

        {/* breadcrumb */}
        <div className="flex justify-between items-center mt-5">
          <div className="font-aptos-semibold flex justify-start">
            <Link
              to="/funding"
              className="text-black hover:text-slate-700 transition-all duration-300"
            >
              Funding365
            </Link>

            <Link
              to={`/funding/${contents[0].companyId.id}`}
              className="text-[#ff7010] hover:text-[#cc5200] transition-all duration-300"
            >
              /{contents[0].companyId.companyName} Funding
            </Link>
          </div>
          <div
            onClick={() => setOpen(true)}
            className="block sm:hidden bg-[#ff7010] cursor-pointer font-aptos-semibold px-3 py-2 rounded text-white"
          >
            Sample
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

        {/* search and sample report */}
        <div className="mt-10 flex justify-between items-center">
          <div className="flex gap-2 items-end">
            <img
              src={contents[0].companyId.companyLogoUrl}
              className="w-15 h-15 rounded-md"
            />
            <h3 className="font-aptos-bold text-xl">
              {contents[0].companyId.companyName}
            </h3>
          </div>

          <div
            onClick={() => setOpen(true)}
            className="hidden md:block bg-[#ff7010] cursor-pointer font-aptos-semibold px-3 py-2 rounded text-white"
          >
            Sample Report
          </div>
        </div>
        {/* table for large device */}
        <div className="my-5 hidden md:block">
          <table className="min-w-full table-fixed">
            <thead className="font-aptos-regular">
              <tr className="bg-[#F67E07] text-white text-center">
                <td className="p-3">FINANCIAL YEAR</td>
                <td className="p-3 whitespace-nowrap">DETAILS OF FUNDING</td>
                <td className="p-3">REPORT</td>
                <td className="p-3">PRICE</td>
                <td className="p-3">ACTION</td>
              </tr>
            </thead>
            <tbody>
              {contents.map((row) => (
                <tr
                  key={row.id}
                  className="odd:bg-white even:bg-slate-200 hover:bg-slate-100 transition duration-300"
                >
                  <td className="p-3 font-aptos-semibold xl:font-aptos-bold whitespace-nowrap text-center">
                    {row.fundingDate}
                  </td>

                  <td className="p-3 w-[50%] text-gray-800 font-aptos-semibold xl:font-aptos-bold">
                    {row.fundingDetails}
                  </td>
                  <td className="p-3 flex justify-center items-center">
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
                            title: 'funding365',
                          })
                        }
                        className="bg-gradient-to-r from-[#ff7010] to-[#cc5c00] text-white rounded-full p-3 hover:scale-110 transition duration-300"
                      >
                        <FaShoppingCart size={20} />
                      </button>
                    </Tippy>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* card for small screen */}
        <div className="grid sm:hidden gap-5 grid-cols-1 my-5">
          {contents.map((row) => (
            <div
              key={row.id}
              className="bg-slate-200 rounded-md p-4 border border-slate-300"
            >
              {/* Image & Description */}
              <div className="min-h-[100px]">
                <img
                  src={pdf}
                  alt="logo"
                  className="w-24 h-24 mr-2 object-contain rounded-md float-left flex-shrink-0"
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
                      title: 'funding365',
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
  )
}

export default Funding365Company
