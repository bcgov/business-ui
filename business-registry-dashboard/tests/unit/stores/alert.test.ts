import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAlertStore } from '#imports'

describe('Alert Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const alertStore = useAlertStore()

    expect(alertStore.alerts).toEqual([])
    expect(alertStore.hasAlerts).toBe(false)
  })

  it('can add an alert', () => {
    const alertStore = useAlertStore()
    alertStore.addAlert({ category: AlertCategory.BUSINESS_DETAILS, severity: 'error' })
    expect(alertStore.alerts).toEqual([{ category: AlertCategory.BUSINESS_DETAILS, severity: 'error' }])
    expect(alertStore.hasAlerts).toBe(true)
  })

  it('can reset alerts', () => {
    const alertStore = useAlertStore()
    alertStore.addAlert({ category: AlertCategory.BUSINESS_DETAILS, severity: 'error' })
    expect(alertStore.alerts).toEqual([{ category: AlertCategory.BUSINESS_DETAILS, severity: 'error' }])
    alertStore.$reset()
    expect(alertStore.alerts).toEqual([])
    expect(alertStore.hasAlerts).toBe(false)
  })
})
