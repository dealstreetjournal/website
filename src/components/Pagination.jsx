import { Link } from 'react-router-dom'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { memo } from 'react'

const Pagination = ({ page, setPage, totalPages }) => {
  return (
    <>
      <div className="font-aptos-bold flex justify-center items-center text-[#ff7010] bg-slate-200 border-2 border-slate-400 rounded overflow-hidden w-fit text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className="flex items-center cursor-pointer gap-1 px-4 py-2 border-r-2 border-slate-400 hover:text-white hover:bg-slate-400 hover:border-slate-400 transition-all duration-300 disabled:cursor-not-allowed"
        >
          <FaAngleLeft />
          Prev
        </button>
        <span className="px-4 py-2 border-r border-slate-300">{page}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          className="flex items-center cursor-pointer gap-1 px-4 py-2 border-l-2 border-slate-400 hover:text-white hover:bg-slate-400 hover:border-slate-400 transition-all duration-300 disabled:cursor-not-allowed"
        >
          Next
          <FaAngleRight />
        </button>
      </div>
    </>
  )
}

export default memo(Pagination)
