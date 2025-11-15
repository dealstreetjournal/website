import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import spinner from '../assets/spinner.png'
import { isAuthenticate } from '../api/authoriseApi'

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const status = await isAuthenticate()
        if (status === 200) {
          setAuth(true)
        } else {
          setAuth(false)
        }
      } catch (error) {
        console.error('Unexpected error during authentication:', error)
        setAuth(false)
      }
    }
    fetchData()
  }, [])

  if (auth === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <img
          src={spinner}
          alt="Loading"
          loading="lazy"
          className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
        />
      </div>
    )
  }
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}
