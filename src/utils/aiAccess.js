import config from '../config'

export function hasAiAccess(userEmail) {
  if (!userEmail) return false
  return config.AI_ACCESS_EMAILS.some(
    (email) => email.toLowerCase() === userEmail.toLowerCase()
  )
}
