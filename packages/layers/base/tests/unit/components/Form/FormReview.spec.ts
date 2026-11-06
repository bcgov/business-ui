import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { FormReview } from '#components'

describe('FormReview', () => {
  it('keeps review content visible and hides submission fields in view-only mode', async () => {
    const wrapper = await mountSuspended(FormReview, {
      props: { viewOnly: true },
      slots: {
        'default': '<div data-testid="review-content">Saved filing details</div>',
        'submission-fields': '<div data-testid="submission-fields">Payment and certification</div>'
      }
    })

    expect(wrapper.find('[data-testid="review-content"]').text()).toBe('Saved filing details')
    expect(wrapper.find('[data-testid="submission-fields"]').exists()).toBe(false)
  })

  it('renders submission fields in the regular review flow', async () => {
    const wrapper = await mountSuspended(FormReview, {
      slots: {
        'default': '<div data-testid="review-content">Saved filing details</div>',
        'submission-fields': '<div data-testid="submission-fields">Payment and certification</div>'
      }
    })

    expect(wrapper.find('[data-testid="review-content"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="submission-fields"]').text()).toBe('Payment and certification')
  })
})
