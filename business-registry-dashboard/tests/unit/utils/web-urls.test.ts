import { describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useRuntimeConfig', () => {
  return () => (
    {
      public: {
        businessDashUrl: 'https://business-dash.example.com',
        nrURL: 'https://namerequest.example.com',
        oneStopUrl: 'https://onestop.example.com',
        corpOLUrl: 'https://corporateonline.example.com',
        llpFormsUrl: 'https://llpforms.example.com',
        lpFormsUrl: 'https://lpforms.example.com',
        xlpFormUrl: 'https://xlpforms.example.com',
        corpFormsUrl: 'https://corpforms.example.com',
        societiesUrl: 'https://societies.example.com'
      }
    }
  )
})

describe('getWebUrl', () => {
  it('should return the correct business URL', () => {
    const urls = getWebUrl()
    expect(urls.getBusinessDashUrl()).toBe('https://business-dash.example.com')
  })

  it('should return the correct name request URL', () => {
    const urls = getWebUrl()
    expect(urls.getNameRequestUrl()).toBe('https://namerequest.example.com')
  })

  it('should return the correct one-stop URL', () => {
    const urls = getWebUrl()
    expect(urls.getOneStopUrl()).toBe('https://onestop.example.com')
  })

  it('should return the correct corporate online URL', () => {
    const urls = getWebUrl()
    expect(urls.getCorporateOnlineUrl()).toBe('https://corporateonline.example.com')
  })

  it('should return the correct LLP forms URL', () => {
    const urls = getWebUrl()
    expect(urls.getLLPFormsUrl()).toBe('https://llpforms.example.com')
  })

  it('should return the correct LP forms URL', () => {
    const urls = getWebUrl()
    expect(urls.getLPFormsUrl()).toBe('https://lpforms.example.com')
  })

  it('should return the correct XLP forms URL', () => {
    const urls = getWebUrl()
    expect(urls.getXLPFormsUrl()).toBe('https://xlpforms.example.com')
  })

  it('should return the correct corporate forms URL', () => {
    const urls = getWebUrl()
    expect(urls.getCorpFormsUrl()).toBe('https://corpforms.example.com')
  })

  it('should return the correct societies URL', () => {
    const urls = getWebUrl()
    expect(urls.getSocietiesUrl()).toBe('https://societies.example.com')
  })
})
