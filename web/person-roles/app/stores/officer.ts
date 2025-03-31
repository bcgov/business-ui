import { z } from 'zod'

export const useOfficerStore = defineStore('officer-store', () => {
  const t = useNuxtApp().$i18n.t

  const officerNameSchema = z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z.string().min(2)
  })

  const officerRoleSchema = z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z.string().min(2)
  })

  const officerSchema = z.object({
    mailingAddress: getRequiredAddress(
      t('validation.address.street'),
      t('validation.address.city'),
      t('validation.address.region'),
      t('validation.address.postalCode'),
      t('validation.address.country')
    ),
    deliveryAddress: getRequiredAddress(
      t('validation.address.street'),
      t('validation.address.city'),
      t('validation.address.region'),
      t('validation.address.postalCode'),
      t('validation.address.country')
    )
  })

  function $reset() {
    sessionStorage.removeItem('officer-store')
  }

  return {
    $reset
  }
}, { persist: true }) // set has viewed in session storage to persist across page refreshes
