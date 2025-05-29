import { describe, it, expect, vi } from 'vitest'
import type { FormErrorEvent } from '#ui/types'

describe('handleFormErrorEvent', () => {
  it('should focus and scroll the element into view if an error exists', () => {
    const mockFocus = vi.fn()
    const mockScrollIntoView = vi.fn()

    document.getElementById = vi.fn().mockReturnValue({
      focus: mockFocus,
      scrollIntoView: mockScrollIntoView
    })

    const event = {
      errors: [{ id: 'input-id' }]
    } as FormErrorEvent

    handleFormErrorEvent(event)

    expect(document.getElementById).toHaveBeenCalledWith('input-id')
    expect(mockFocus).toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
  })

  it('should do nothing if there are no errors', () => {
    document.getElementById = vi.fn()

    const event = { errors: [] }

    // @ts-expect-error
    handleFormErrorEvent(event)

    expect(document.getElementById).not.toHaveBeenCalled()
  })

  it('should do nothing if the element is not found', () => {
    document.getElementById = vi.fn().mockReturnValue(null)

    const event = {
      errors: [{ id: 'non-existent-id' }]
    } as FormErrorEvent

    handleFormErrorEvent(event)

    expect(document.getElementById).toHaveBeenCalledWith('non-existent-id')
  })
})
