import { useRef, useState } from 'react'

// Tilts toward the cursor as it moves across the card (a subtle 3D
// perspective effect) and settles back flat on mouse-leave — makes a card
// respond continuously to where the pointer actually is, not just whether
// it's hovering at all.
export default function TiltCard({ children, className = '', maxTilt = 8, as = 'div', ...rest }) {
  const Tag = as
  const ref = useRef(null)
  const [style, setStyle] = useState({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 400ms ease-out',
  })

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setStyle({
      transform: `perspective(800px) rotateX(${-py * maxTilt * 2}deg) rotateY(${px * maxTilt * 2}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 100ms ease-out',
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 500ms ease-out',
    })
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
