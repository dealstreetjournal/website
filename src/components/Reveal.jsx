import { useInView } from 'react-intersection-observer'

// Fades an element up into place the first time it scrolls into view —
// shared by every section on the Jobs page so content arrives with motion
// instead of just appearing.
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  scale = 1,
  rotate = 0,
  duration = 700,
  className = '',
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  const restTransform = 'translateY(0) scale(1) rotate(0deg)'
  const startTransform = `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? restTransform : startTransform,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
