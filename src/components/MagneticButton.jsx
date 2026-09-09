import { useRef, useState } from 'react'

// Pulls slightly toward the cursor as it passes nearby, then springs back —
// the "magnetic button" effect common on modern product/agency sites.
export default function MagneticButton({ children, className = '', strength = 0.35, ...rest }) {
  const ref = useRef(null)
  const [style, setStyle] = useState({
    transform: 'translate(0px, 0px)',
    transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  })

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    setStyle({
      transform: `translate(${x * strength}px, ${y * strength}px)`,
      transition: 'transform 120ms ease-out',
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'translate(0px, 0px)',
      transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }

  return (
    <a
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </a>
  )
}
