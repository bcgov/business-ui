/** save data blob to computer */
export const saveBlob = (blob: Blob, fileName: string) => {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName)
  } else {
    // for other browsers, create a link pointing to the ObjectURL containing the blob
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    window.document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }
}

/** Download the file as the given filename. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadFile = (data: any, fileName: string) => {
  const blob = new Blob([data])
  saveBlob(blob, fileName)
}
