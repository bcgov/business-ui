// create a screenshot path based on titlePath
export function createScreenshotPath (titlePath: string[]): string {
  const baseDir = 'tests/e2e/screenshots'
  const filePath = titlePath[0]
  const testHierarchy = titlePath.slice(1) // get describe and test names
  const filePathWithoutFileName = filePath.substring(0, filePath.lastIndexOf('/')) // remove extension from filename
  const transformedPath = [filePathWithoutFileName, ...testHierarchy] // create folder structure, lowercase names and split with -
    .map(segment => segment.toLowerCase().replace(/\s+/g, '-'))
    .join('/')
  return `${baseDir}/${transformedPath}.png`
}
