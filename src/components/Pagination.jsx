import { memo } from 'react'

const Pagination = ({ page, setPage, totalPages }) => {
  // Calculate start and end
  const start = Math.max(page - 2, 1)
  const end = Math.min(page + 2, totalPages)

  const pageNumbers = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  )

  return (
    <div className="font-aptos-bold flex justify-center items-center text-[#6B7280] text-md mt-15">
      {/* Previous */}
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`px-4 py-2 border-2 border-[#E5E7EB] rounded-lg transition-all duration-300 ${
          page === 1
            ? 'cursor-not-allowed text-[#6B7280]'
            : 'cursor-pointer hover:text-white hover:bg-[#ff7010]'
        }`}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => setPage(num)}
          className={`px-4 py-2 border-2 border-[#E5E7EB] rounded-lg ml-2 transition-all duration-300 ${
            num === page
              ? 'bg-[#ff7010] text-white '
              : 'hidden sm:block hover:bg-[#ff7010] hover:text-white cursor-pointer'
          }`}
        >
          {num}
        </button>
      ))}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className={`px-4 py-2 border-2 border-[#E5E7EB] ml-2 rounded-lg transition-all duration-300 ${
          page === totalPages
            ? 'cursor-not-allowed text-[#6B7280]'
            : 'cursor-pointer hover:text-white hover:bg-[#ff7010]'
        }`}
      >
        Next
      </button>
    </div>
  )
}

export default memo(Pagination)
