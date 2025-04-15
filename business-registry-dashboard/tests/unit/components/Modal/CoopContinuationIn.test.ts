import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ModalCoopContinuationIn } from '#components'

// Mock the useBrdModals composable using mockNuxtImport instead of vi.mock
const mockClose = vi.fn()
mockNuxtImport('useBrdModals', () => {
  return () => ({
    openContinuationInCoopModal: vi.fn(),
    close: mockClose
  })
})

describe('<ModalCoopContinuationIn />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mount correctly', async () => {
    const wrapper = await mountSuspended(ModalCoopContinuationIn)

    expect(ModalCoopContinuationIn).toBeDefined()
    expect(wrapper).toBeTruthy()
    expect(wrapper.vm).toBeDefined()
  })

  it('should call close method when close button is clicked', async () => {
    const wrapper = await mountSuspended(ModalCoopContinuationIn)

    // Get the TypeScript typed component instance to call the method
    const vm = wrapper.vm as any
    // Call the closeModal method directly
    await vm.closeModal()

    // Verify close method was called
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})
