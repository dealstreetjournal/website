export const handleDate = (dateArray) => {
  if (dateArray) {
    const date = new Date(dateArray)
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    return formattedDate
  }
  return ''
}
