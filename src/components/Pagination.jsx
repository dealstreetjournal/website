import { Link } from 'react-router-dom'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { memo } from 'react'

const Pagination = ({ page, setPage, totalPages }) => {
  return (
    <>
      <div className="font-aptos-bold flex justify-center items-center text-[#ff7010] bg-slate-200 border-2 border-slate-400 rounded overflow-hidden w-fit text-sm mt-15">
        <button
          disabled={page === 1}
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className={`flex items-center gap-1 px-4 py-2 border-r-2 border-slate-400 transition-all duration-300 
    ${
      page === 1
        ? 'cursor-not-allowed opacity-50 bg-gray-200 text-gray-500'
        : 'cursor-pointer hover:text-white hover:bg-slate-400 hover:border-slate-400'
    }`}
        >
          <FaAngleLeft />
          Prev
        </button>

        <span className="px-4 py-2 border-r border-slate-300">{page}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          className={`flex items-center gap-1 px-4 py-2 border-l-2 border-slate-400 transition-all duration-300 
    ${
      page === totalPages
        ? 'cursor-not-allowed opacity-50 bg-gray-200 text-gray-500'
        : 'cursor-pointer hover:text-white hover:bg-slate-400 hover:border-slate-400'
    }`}
        >
          Next
          <FaAngleRight />
        </button>
      </div>
    </>
  )
}

export default memo(Pagination)
