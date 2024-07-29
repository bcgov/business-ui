// YourComponent.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { useBusinessStore, useAccountStore } from '#imports'
import { mockNewAccount, mockedBusinessFull } from '~/tests/mocks/mockedData'
import BusinessEmail from '~/components/content/BusinessEmail.vue'

describe('<BusinessEmail />', () => {
  beforeEach(() => {
    resetPiniaStores()
  })
  it('mounts', async () => {
    const component = await renderSuspended(BusinessEmail)

    expect(component).toBeTruthy()
  })

  it('displays the email from the current account if it exists in the store', async () => {
    useAccountStore().currentAccount = {
      ...mockNewAccount,
      // @ts-ignore
      mailingAddress: [{ email: 'account@email.com' }]
    }
    useBusinessStore().currentBusiness = mockedBusinessFull.business
    const component = await renderSuspended(BusinessEmail)
    expect(component.getByText('account@email.com')).toBeTruthy()
  })

  it('displays the email from business invitation email if no account email found', async () => {
    useBusinessStore().currentBusiness = mockedBusinessFull.business
    const component = await renderSuspended(BusinessEmail)
    expect(component.getByText('test@example.com')).toBeTruthy()
  })

  it('displays "No email found" if no email is available', async () => {
    const component = await renderSuspended(BusinessEmail)
    expect(component.getByText('No email found')).toBeTruthy()
  })
})
