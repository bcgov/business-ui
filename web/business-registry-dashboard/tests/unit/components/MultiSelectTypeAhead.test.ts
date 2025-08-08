import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import { MultiSelectTypeAhead } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

const mockOptions = [
  'BC Sole Proprietorship',
  'BC Limited Company',
  'BC Unlimited Liability Company',
  'BC General Partnership',
  'BC Benefit Company',
  'BC Community Contribution Company',
  'BC Cooperative Association',
  'Extraprovincial Company',
  'Name Request',
  'Registration',
  'Incorporation Application',
  'Continuation Application',
  'Amalgamation Application'
]

describe('MultiSelectTypeAhead', () => {
  const defaultProps = {
    modelValue: [],
    options: mockOptions,
    placeholder: 'Select type...',
    label: 'Filter by type',
    sectionBreakBefore: []
  }

  it('should mount successfully', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: defaultProps,
      global: {
        plugins: [enI18n]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should filter options based on prefix word matching', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: defaultProps,
      global: {
        plugins: [enI18n]
      }
    })

    // Click on the display div to open the dropdown first
    await wrapper.find('div[class*="cursor-pointer"]').trigger('click')
    await nextTick()

    // Now find the input that appears when opened
    const input = wrapper.find('input')
    await input.setValue('BC')
    await input.trigger('input')
    await nextTick()

    // Should match all options that start with "BC"
    const visibleOptions = wrapper.findAll('[data-testid="option"]')
    expect(visibleOptions.length).toBeGreaterThan(0)

    // Verify that "Name Request" is NOT included (doesn't start with "BC")
    const optionTexts = visibleOptions.map(option => option.text())
    expect(optionTexts).not.toContain('Name Request')
    expect(optionTexts).toContain('BC Limited Company')
  })

  it('should match words that start with search term (not middle of words)', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: defaultProps,
      global: {
        plugins: [enI18n]
      }
    })

    // Click on the display div to open the dropdown first
    await wrapper.find('div[class*="cursor-pointer"]').trigger('click')
    await nextTick()

    const input = wrapper.find('input')

    // Test "Re" - should match "Registration" (starts with "Re")
    // but NOT "Extraprovincial" (has "re" in middle)
    await input.setValue('Re')
    await input.trigger('input')
    await nextTick()

    const visibleOptions = wrapper.findAll('[data-testid="option"]')
    const optionTexts = visibleOptions.map(option => option.text())

    expect(optionTexts).toContain('Registration')
    expect(optionTexts).not.toContain('Extraprovincial Company')
  })

  it('should handle multi-word matching correctly', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: defaultProps,
      global: {
        plugins: [enI18n]
      }
    })

    // Click on the display div to open the dropdown first
    await wrapper.find('div[class*="cursor-pointer"]').trigger('click')
    await nextTick()

    const input = wrapper.find('input')

    // Test "App" - should match "Incorporation Application" and "Amalgamation Application"
    await input.setValue('App')
    await input.trigger('input')
    await nextTick()

    const visibleOptions = wrapper.findAll('[data-testid="option"]')
    const optionTexts = visibleOptions.map(option => option.text())

    expect(optionTexts).toContain('Incorporation Application')
    expect(optionTexts).toContain('Amalgamation Application')
    expect(optionTexts).toContain('Continuation Application')
  })

  it('should show all options when search is empty', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: defaultProps,
      global: {
        plugins: [enI18n]
      }
    })

    // Click on the display div to open the dropdown first
    await wrapper.find('div[class*="cursor-pointer"]').trigger('click')
    await nextTick()

    const visibleOptions = wrapper.findAll('[data-testid="option"]')
    expect(visibleOptions.length).toBe(mockOptions.length)
  })

  it('should display correct text based on selection', async () => {
    const wrapper = await mountSuspended(MultiSelectTypeAhead, {
      props: {
        ...defaultProps,
        modelValue: ['BC Limited Company']
      },
      global: {
        plugins: [enI18n]
      }
    })

    // When closed, check the display div content
    const displayDiv = wrapper.find('div[class*="cursor-pointer"]')
    expect(displayDiv.text()).toContain('BC Limited Company')

    // Test multiple selections
    await wrapper.setProps({
      modelValue: ['BC Limited Company', 'Registration']
    })
    await nextTick()

    expect(displayDiv.text()).toContain('Multiple')
  })
})
