export function getWebUrl () {
  const config = useRuntimeConfig().public

  function getBusinessDashUrl () {
    // this needs trailing slash
    return config.businessDashUrl as string
  }

  function getNameRequestUrl () {
    return config.nrURL as string
  }

  function getOneStopUrl () {
    return config.oneStopUrl as string
  }

  function getCorporateOnlineUrl () {
    return config.corpOLUrl as string
  }

  function getLLPFormsUrl () {
    return config.llpFormsUrl as string
  }

  function getLPFormsUrl () {
    return config.lpFormsUrl as string
  }

  function getXLPFormsUrl () {
    return config.xlpFormUrl as string
  }

  function getCorpFormsUrl () {
    return config.corpFormsUrl as string
  }

  function getSocietiesUrl () {
    return config.societiesUrl as string
  }

  return {
    getBusinessDashUrl,
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
