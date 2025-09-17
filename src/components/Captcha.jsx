// Captcha.jsx
import React, { useEffect, useRef, useState } from 'react'
import { FiRotateCw } from 'react-icons/fi'

const Captcha = ({ onValidate }) => {
  const [captcha, setCaptcha] = useState('')
  const [input, setInput] = useState('')
  const canvasRef = useRef(null)

  const generateCaptcha = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptcha(result)
  }

  const drawCaptcha = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#000'
    ctx.setTransform(1, 0.1, 0.2, 1, 0, 0)
    ctx.fillText(captcha, 0, 30)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.strokeStyle = '#999'
      ctx.stroke()
    }
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  useEffect(() => {
    if (captcha) drawCaptcha()
  }, [captcha])

  useEffect(() => {
    if (input && onValidate) {
      onValidate(input === captcha)
    }
  }, [input, captcha])

  return (
    <div className="flex items-center gap-2 w-full">
      <canvas
        ref={canvasRef}
        width="100"
        height="40"
        style={{ border: '1px solid #ccc' }}
      />
      <FiRotateCw
        size={24}
        className="text-[#ff7010] cursor-pointer"
        onClick={generateCaptcha}
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter CAPTCHA"
        className="w-full rounded-md px-2 py-1 bg-white border border-gray-300 outline-none"
      />
    </div>
  )
}

export default Captcha
