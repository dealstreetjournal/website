import { useEffect, useState } from 'react'
import { CartContext } from '../cart/CartContext'
import { cartCountApi } from '../../api/cartApi'

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)

  // Function to increment cart count
  const incrementCartCount = () => {
    setCartCount((prevCount) => prevCount + 1)
  }

  // Function to decrement cart count
  const decrementCartCount = () => {
    setCartCount((prevCount) => Math.max(0, prevCount - 1))
  }

  // Function to set cart count directly (useful for initial load from API)
  const setCartCountDirectly = (count) => {
    setCartCount(count)
  }

  // Function to reset cart count
  const resetCartCount = () => {
    setCartCount(0)
  }

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const count = await cartCountApi()
        if (count) {
          setCartCount(count)
        }
      } catch (error) {
        console.error('Error loading cart count:', error)
      }
    }
    loadCartCount()
  }, [])

  const value = {
    cartCount,
    incrementCartCount,
    decrementCartCount,
    setCartCountDirectly,
    resetCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
