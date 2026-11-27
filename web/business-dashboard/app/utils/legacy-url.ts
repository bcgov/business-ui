/** Whether the path is the app root, with or without a locale prefix. */
export function isRootPath(path: string, localeCodes: string[]): boolean {
  const segments = path.split('/').filter(Boolean)
  return segments.length === 0 || (segments.length === 1 && localeCodes.includes(segments[0]!))
}

/** The same url under the default locale, or undefined when it already has a locale prefix. */
export function getLocalePrefixedUrl(fullPath: string, localeCodes: string[], defaultLocale: string) {
  const firstSegment = fullPath.split(/[/?#]/)[1] ?? ''
  return localeCodes.includes(firstSegment) ? undefined : `/${defaultLocale}${fullPath}`
}
