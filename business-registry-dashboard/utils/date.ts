import moment from 'moment'

/** Return the date string as a date
 * @param dateString expected dateString format: YYYY-MM-DD
*/
export function dateStringToDate (dateString: string) {
  // convert to date
  const date = new Date(dateString)
  // @ts-ignore
  if (isNaN(date)) { return null }
  // return date offsetted by local timezone (otherwise it defaults to UTC at 12am)
  const localOffset = date.getTimezoneOffset()
  return moment(date).add(localOffset, 'm').toDate()
}

/** Return the date as a string in the desired format
 * @param date js Date
 * @param format default: YYYY-MM-DDT:HH:mm:ss+-HH:mm
*/
export function dateToString (date: Date, format?: string) {
  return (date) ? moment(date).local().format(format) : ''
}

/** Return the date string in date format from datetime string format
 * @param datetimeString expected format: YYYY-MM-DDT:HH:mm:ss+-HH:mm
*/
export function datetimeStringToDateString (datetimeString: string) {
  const date = new Date(datetimeString)
  // convert to date and back so that it returns correctly for the timezone
  return (date) ? moment(date).local().format('YYYY-MM-DD') : ''
}

export function addOneYear (dateString: string) {
  const date = dateStringToDate(dateString)
  return moment(date).add(1, 'year').format('YYYY-MM-DD')
}
