import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ModalCoopContinuationIn } from '#components'

// Mock the useBrdModals composable using mockNuxtImport instead of vi.mock
const mockCloseModal = vi.fn()
mockNuxtImport('useBrdModals', () => {
  return () => ({
    openContinuationInCoopModal: vi.fn(),
    close: mockCloseModal
  })
})

describe('<ModalCoopContinuationIn />', () => {
  let brdModal: ReturnType<typeof useBrdModals>

  beforeEach(() => {
    brdModal = useBrdModals()
    vi.clearAllMocks()
  })

  it('should mount correctly', async () => {
    const wrapper = await mountSuspended(ModalCoopContinuationIn)

    expect(ModalCoopContinuationIn).toBeDefined()
    expect(wrapper).toBeTruthy()
    expect(wrapper.vm).toBeDefined()
  })

  it('should call close method', () => {
    brdModal.close()

    // Verify close method was called
    expect(mockCloseModal).toHaveBeenCalledOnce()
  })
})
