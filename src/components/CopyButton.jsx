import { useState } from 'react'
import { FaCopy, FaCheck } from 'react-icons/fa'

// Uses navigator.clipboard.writeText() only — deliberately NOT document.execCommand('copy'),
// since that dispatches a native 'copy' DOM event, which useContentProtection.jsx blocks
// site-wide (anti-scraping protection for paid report content). The Clipboard API writes to
// the OS clipboard directly without dispatching that event, so it works from a real button
// click (a user gesture) without needing to weaken that protection anywhere on the site.
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (non-secure context or unsupported browser) — nothing
      // else to fall back to here without re-triggering the blocked native copy event.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <FaCheck className="text-emerald-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <FaCopy />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
