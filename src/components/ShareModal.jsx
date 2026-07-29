import React, { useState } from 'react'
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaXTwitter,
  FaLink,
  FaCheck,
  FaXmark,
  FaShareNodes,
} from 'react-icons/fa6'

const ShareModal = ({ isOpen, onClose, title, description, imageUrl, url }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const shortDesc = description?.slice(0, 120) || ''
  const encodedDesc = encodeURIComponent(shortDesc)

  const platforms = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-[#25D366]',
      href: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDesc}%0A%0A${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-[#0077B5]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    },
    {
      name: 'Twitter / X',
      icon: FaXTwitter,
      color: 'bg-black',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=DealStreetJournal`,
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleNativeShare = () => {
    navigator.share({ title, text: shortDesc, url })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaShareNodes className="text-[#ff7010]" size={16} />
            <h3 className="font-aptos-bold text-base">Share Article</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <FaXmark size={15} />
          </button>
        </div>

        {/* Preview Card — looks like the actual share card */}
        <div className="mx-4 mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-36 object-cover"
            />
          )}
          <div className="px-3 py-2.5 bg-gray-50">
            <p className="text-[10px] text-[#ff7010] uppercase tracking-widest font-aptos-semibold">
              dealstreetjournal.com
            </p>
            <p className="font-aptos-semibold text-sm mt-0.5 leading-snug line-clamp-2">
              {title}
            </p>
            {shortDesc && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-aptos-regular leading-relaxed">
                {shortDesc}
              </p>
            )}
          </div>
        </div>

        {/* Platform Buttons */}
        <div className="grid grid-cols-4 gap-2 px-4 mt-5">
          {platforms.map(({ name, icon: Icon, color, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group"
              onClick={onClose}
            >
              <div
                className={`${color} text-white w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-150 shadow-md`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] text-gray-500 font-aptos-regular text-center leading-tight">
                {name}
              </span>
            </a>
          ))}
        </div>

        {/* Copy Link Bar */}
        <div className="px-4 mt-5 mb-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
            <FaLink size={12} className="text-gray-400 shrink-0" />
            <span className="text-gray-500 text-xs truncate flex-1 font-aptos-regular select-all">
              {url}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-aptos-semibold px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                copied
                  ? 'bg-green-100 text-green-600'
                  : 'bg-[#ff7010] text-white hover:bg-orange-600 active:scale-95'
              }`}
            >
              {copied ? <FaCheck size={10} /> : <FaLink size={10} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Native Share (mobile only) */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <div className="px-4 pb-5">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-aptos-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              More options
            </button>
          </div>
        )}
        {!(typeof navigator !== 'undefined' && typeof navigator.share === 'function') && (
          <div className="pb-5" />
        )}
      </div>
    </div>
  )
}

export default ShareModal
