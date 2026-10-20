/* eslint-disable @typescript-eslint/no-explicit-any */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { ManageShareStructure } from '#components'

mockNuxtImport('useConnectButtonControl', () => () => ({ setAlertText: vi.fn() }))

const stubs = {
  UButton: true,
  USeparator: true,
  HelpExpansion: true,
  ConnectPageSection: defineComponent({ name: 'ConnectPageSection', template: '<div><slot /></div>' }),
  ConnectFieldset: defineComponent({ name: 'ConnectFieldset', template: '<div><slot /></div>' }),
  FormShareClass: true,
  FormShareSeries: true,
  FormShareResolutionDate: defineComponent({
    name: 'FormShareResolutionDate',
    props: ['validationContext'],
    template: '<div data-testid="rd-form" :data-required="!!validationContext?.hasRightsOrRestrictions" />'
  }),
  TableShareStructure: defineComponent({
    name: 'TableShareStructure',
    props: { expanded: Object },
    template: '<div />'
  }),
  TableShareStructureResolutionDates: defineComponent({
    name: 'TableShareStructureResolutionDates',
    props: { expanded: Object },
    template: '<div />'
  })
}

describe('ManageShareStructure — resolution date add section in correction', () => {
  it(
    'shows the add-resolution-date input in a correction filing even when shares were not changed this session',
    async () => {
      const wrapper = await mountSuspended(ManageShareStructure, {
        props: {
          variant: 'correct',
          collectResolutionDate: true
        },
        global: { stubs }
      })
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="rd-form"]').exists()).toBe(true)
    }
  )

  // note: collectResolutionDate does not gate the 'correct' variant (see previous test) —
  // only non-correct variants fall through to resolutionDateRequired, which does check it
  it('hides the add-resolution-date input when collectResolutionDate is false and variant is not correct', async () => {
    const wrapper = await mountSuspended(ManageShareStructure, {
      props: {
        variant: 'default',
        collectResolutionDate: false
      },
      global: { stubs }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="rd-form"]').exists()).toBe(false)
  })

  it(
    'does not require a resolution date in a correction filing for a new share class with rights or restrictions',
    async () => {
      const wrapper = await mountSuspended(ManageShareStructure, {
        props: {
          variant: 'correct',
          collectResolutionDate: true
        },
        global: { stubs }
      })
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const form = wrapper.find('[data-testid="rd-form"]')
      expect(form.exists()).toBe(true)
      expect(form.attributes('data-required')).toBe('false')
    }
  )

  it(
    'requires a resolution date outside of corrections when a new share class with rights or restrictions was added',
    async () => {
      const { shareClasses } = useManageShareStructure()
      shareClasses.value = [
        {
          new: { id: 'c1', name: 'A Shares', actions: [ActionType.ADDED], series: [], hasRightsOrRestrictions: true },
          old: undefined
        } as any
      ]

      const wrapper = await mountSuspended(ManageShareStructure, {
        props: {
          variant: 'default',
          collectResolutionDate: true
        },
        global: { stubs }
      })
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const form = wrapper.find('[data-testid="rd-form"]')
      expect(form.exists()).toBe(true)
      expect(form.attributes('data-required')).toBe('true')
    }
  )
})
