export const handleDate = (dateArray) => {
  if (dateArray) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const year = dateArray[0]
    const month = months[dateArray[1] - 1] // month name
    const day = String(dateArray[2]).padStart(2, '0') // ensure two digits

    return `${day} ${month} ${year}`
  }
  return ''
}
