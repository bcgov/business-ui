export function getWebUrl () {
  const config = useRuntimeConfig().public

  function getBusinessURL () {
    // this needs trailing slash
    return config.businessUrl
  }

  function getNameRequestUrl () {
    return config.nrURL
  }

  function getOneStopUrl () {
    return config.oneStopUrl
  }

  function getCorporateOnlineUrl () {
    return config.corpOLUrl
  }

  function getLLPFormsUrl () {
    return config.llpFormsUrl
  }

  function getLPFormsUrl () {
    return config.lpFormsUrl
  }

  function getXLPFormsUrl () {
    return config.xlpFormUrl
  }

  function getCorpFormsUrl () {
    return config.corpFormsUrl
  }

  function getSocietiesUrl () {
    return config.societiesUrl
  }

  return {
    getBusinessURL,
    getCorpFormsUrl,
    getCorporateOnlineUrl,
    getLLPFormsUrl,
    getLPFormsUrl,
    getNameRequestUrl,
    getOneStopUrl,
    getSocietiesUrl,
    getXLPFormsUrl
  }
}
