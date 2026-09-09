import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

// Counts up from 0 to `to` once the number scrolls into view — a small
// "something happened" moment rather than a stat that just appears static.
export default function Counter({ to, duration = 1600, suffix = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const [value, setValue] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!inView) return
    let raf
    const step = (timestamp) => {
      if (startRef.current == null) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.floor(eased * to))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
