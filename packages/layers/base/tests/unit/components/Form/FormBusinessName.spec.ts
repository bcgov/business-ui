import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import { FormBusinessName } from '#components'

const mountComponent = (props = {}) => {
  return mountSuspended(FormBusinessName, {
    props: {
      businessIdentifier: 'BC1234567',
      businessType: CorpTypeCd.BC_COMPANY,
      initialCompanyName: 'Old Name Ltd.',
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NAME_TO_NUMBER,
        CorrectNameOption.CORRECT_NEW_NR
      ],
      filingName: 'Correction',
      nrAllowedActionTypes: [],
      modelValue: { legalName: '', nrNumber: '', changeToNumbered: false },
      ...props
    }
  })
}

describe('FormBusinessName', () => {
  it('should render the correct accordian items based on the correctNameOptions prop', async () => {
    let wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NEW_NR
      ]
    })

    let accordion = wrapper.findComponent({ name: 'UAccordion' })
    let items = accordion.props('items')

    expect(items).toHaveLength(2)
    expect(items[0].changeOption).toBe(CorrectNameOption.CORRECT_NAME)
    expect(items[1].changeOption).toBe(CorrectNameOption.CORRECT_NEW_NR)

    wrapper.unmount()

    wrapper = await mountComponent({
      correctNameOptions: [
        CorrectNameOption.CORRECT_NAME,
        CorrectNameOption.CORRECT_NAME_TO_NUMBER
      ]
    })

    accordion = wrapper.findComponent({ name: 'UAccordion' })
    items = accordion.props('items')

    expect(items).toHaveLength(2)
    expect(items[0].changeOption).toBe(CorrectNameOption.CORRECT_NAME)
    expect(items[1].changeOption).toBe(CorrectNameOption.CORRECT_NAME_TO_NUMBER)

    wrapper.unmount()
  })
})
