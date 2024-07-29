// deeply compare 2 objects
export function deepEqual (object1: any, object2: any, ignore: string[] = []): boolean {
  if (object1 === object2) {
    return true
  }

  // return false if null or not an object
  if (typeof object1 !== 'object' || typeof object2 !== 'object' || object1 === null || object2 === null) {
    return false
  }

  // get the keys of each object
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)

  // return false if keys.length arent equal
  if (keys1.length !== keys2.length) {
    return false
  }

  // check each key, value pair and compare
  for (const key of keys1) {
    // skip any keys in the ignore array
    if (ignore.includes(key)) {
      continue
    }

    // return false if key/value doesnt match
    if (!deepEqual(object1[key], object2[key], ignore)) {
      return false
    }
  }

  // return true if all equal
  return true
}
