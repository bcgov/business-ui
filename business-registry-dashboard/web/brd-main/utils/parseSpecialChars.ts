// create new DOM parser
let parser: DOMParser | undefined
if (process.client) { // only allow on client
  parser = new DOMParser()
}

// handles parsing special character strings
export function parseSpecialChars (text: string | undefined | null, fallback = 'N/A') {
  // return fallback text if text is undefined/null
  if (!text) {
    return fallback
  }

  // check if parser is available, only runs on client
  if (parser) {
  // match any non word or non accented character
    const regex = /[^\w\sÀ-ÿ]/u

    // check if text contains any special characters
    if (regex.test(text)) {
      try {
      // parse text using DOM parser
        const parsedText = parser.parseFromString(text, 'text/html')
        return parsedText.body.textContent ?? fallback
      } catch (error) {
        console.error(`Error parsing special characters in: ${text}`, error)
        return fallback
      }
    }
  }
  // return original text if no special characters or if parser is undefined
  return text
}
