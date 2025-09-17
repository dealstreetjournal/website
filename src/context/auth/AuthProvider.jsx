import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { AuthContext } from '../auth/AuthContext'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const email = Cookies.get('userEmail')
    console.log('AuthProvider: Initial email from cookie:', email) // Debug log
    if (email) {
      setUser(email)
    }
    setLoading(false)
  }, [])

  const login = (email) => {
    console.log('AuthProvider: Login called with:', email) // Debug log

    Cookies.set('userEmail', email, { expires: 1 })

    setUser(email)
  }

  const logout = () => {
    console.log('AuthProvider: Logout called, current user:', user) // Debug log
    Cookies.remove('userEmail')
    setUser(null)
    console.log('AuthProvider: User cleared, cookie removed') // Debug log
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  console.log('AuthProvider: Current user state:', user) // Debug log

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
