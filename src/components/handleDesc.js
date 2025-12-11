import DOMPurify from 'dompurify'

export const handleDesc = (desc) => {
  if (!desc) return

  // sanitize full HTML
  const sanitized = DOMPurify.sanitize(desc)

  // convert to DOM
  const parser = new DOMParser()
  const doc = parser.parseFromString(sanitized, 'text/html')

  // extract ONLY text (no HTML tags)
  const plainText = doc.body.textContent || ''

  // trim long spaces & newlines
  const cleanText = plainText.replace(/\s+/g, ' ').trim()

  return cleanText
}
