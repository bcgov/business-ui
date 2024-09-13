import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { ModalManageBusiness } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

// const mockAuthApi = vi.fn()
// const mockLegalApi = vi.fn()
// mockNuxtImport('useNuxtApp', () => {
//   return () => (
//     {
//       deferHydration: vi.fn(),
//       $authApi: mockAuthApi,
//       $legalApi: mockLegalApi
//     }
//   )
// })

// const modalSymbol = Symbol('nuxt-ui.modal')

describe.skip('<ModalManageBusiness />', () => { // TODO: figure out how to test UModal components
  it('should mount', async () => {
    const wrapper = await mountSuspended(ModalManageBusiness, {
      props: {
        business: {
          bn: '123',
          identifier: '123',
          legalType: 'some type',
          name: 'some name',
          score: 42,
          status: 'some status'
        }
      },
      global: {
        plugins: [enI18n],
        provide: {
          // Mock the modal injection
          [Symbol('nuxt-ui.modal')]: {
            open: vi.fn(),
            close: vi.fn()
          }
        }
      }
    })

    expect(wrapper.html()).toContain('<span>something</span>')
  })
})
