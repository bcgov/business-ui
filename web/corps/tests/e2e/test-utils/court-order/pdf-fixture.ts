/**
 * Builds a minimal, valid, single-page, unencrypted, letter-size (8.5in x 11in / 612 x 792pt) PDF
 * as raw bytes for use with `page.setInputFiles()`.
 *
 * The court order file upload runs a client-side pdfjs check (letter-size, encryption, corrupt-file
 * - see `Form/CourtOrderPoa/Full/FileUpload/utils.ts` `validatePdf`) before uploading to DRS, so a
 * real (not just a `application/pdf`-mimetype-labelled) PDF is required for the upload to succeed.
 */
export function createLetterSizePdfBuffer(): Buffer {
  const header = '%PDF-1.4\n'

  const streamContent = 'BT /F1 24 Tf 72 700 Td (Court Order Test Document) Tj ET'

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]'
    + ' /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ]

  let cursor = Buffer.byteLength(header, 'ascii')
  const offsets: number[] = []
  for (const obj of objects) {
    offsets.push(cursor)
    cursor += Buffer.byteLength(obj, 'ascii')
  }

  const xrefOffset = cursor
  const objectCount = objects.length + 1 // +1 for the free-list head entry (object 0)

  let xref = `xref\n0 ${objectCount}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`
  }

  const trailer = `trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(header + objects.join('') + xref + trailer, 'ascii')
}
