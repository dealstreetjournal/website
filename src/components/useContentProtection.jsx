import { useEffect } from 'react'

export default function useContentProtection() {
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault()
    const blockActions = (e) => e.preventDefault()

    const disableKeys = (e) => {
      if (e.keyCode === 123) e.preventDefault()

      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) {
        e.preventDefault()
      }

      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', disableRightClick)
    document.addEventListener('copy', blockActions)
    document.addEventListener('cut', blockActions)
    document.addEventListener('paste', blockActions)
    document.addEventListener('selectstart', blockActions)
    document.addEventListener('keydown', disableKeys)

    return () => {
      document.removeEventListener('contextmenu', disableRightClick)
      document.removeEventListener('copy', blockActions)
      document.removeEventListener('cut', blockActions)
      document.removeEventListener('paste', blockActions)
      document.removeEventListener('selectstart', blockActions)
      document.removeEventListener('keydown', disableKeys)
    }
  }, [])
}
