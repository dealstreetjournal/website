import React from 'react'

const ErrorPage = ({ data }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {/* GIF */}
        <img
          src="https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
          alt="Fixing error"
          className="w-40 mx-auto mb-4"
        />

        {/* Error Code */}
        {/* <h1 className="text-6xl font-bold text-[#ff7010]">{code}</h1> */}

        {/* Message */}
        <h2 className="text-xl font-semibold mt-2 text-gray-800">{data}</h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2">
          Oops! Our team is fixing this issue 🛠️ Please try again in a moment.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => (window.location.href = '/')}
            className="px-5 py-2 rounded-lg bg-[#ff7010] text-white hover:bg-[#e65f00] transition"
          >
            Go Home
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg border border-[#ff7010] text-[#ff7010] hover:bg-[#ff7010] hover:text-white transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
