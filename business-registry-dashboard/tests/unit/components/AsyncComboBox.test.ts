import { describe, it, expect, afterEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { VueWrapper, flushPromises } from '@vue/test-utils'
import { AsyncComboBox, UInput } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

const searchFnMock = vi.fn((query) => {
  if (query === 'disabled') {
    return Promise.resolve([
      { id: '1', name: 'Disabled Item', disabled: true }
    ])
  } else {
    return Promise.resolve([
      { id: '2', name: 'Item 1', disabled: false },
      { id: '3', name: 'Item 2', disabled: false }
    ])
  }
})

const testProps = {
  searchFn: searchFnMock,
  idAttr: 'id',
  valueAttr: 'name',
  text: {
    placeholder: 'Search...',
    arialabel: 'Search'
  },
  disabledConfig: {
    items: [{ id: '1', name: 'Disabled Item' }],
    comparisonAttrs: ['id']
  }
}

function mountComp (props = testProps) {
  return mountSuspended(AsyncComboBox, {
    props,
    global: {
      plugins: [enI18n],
      components: {
        UInput
      }
    }
  })
}

function waitForDebounce (assertionsCallback: any, timeout = 500) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assertionsCallback() // Run the assertions passed as a callback
      resolve() // resolve the promise after assertions
    }, timeout) // wait for debounce to complete
  })
}

describe('<AsyncComboBox />', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
    wrapper.unmount()
  })

  it('should mount', async () => {
    wrapper = await mountComp()
    expect(wrapper).toBeTruthy()
  })

  it('renders properly and searches items', async () => {
    wrapper = await mountComp()

    // set input value
    await wrapper.find('input').setValue('Item')

    await flushPromises()
    await nextTick()

    await waitForDebounce(() => {
      // search function should be called
      expect(searchFnMock).toHaveBeenCalledWith('Item')

      // should have 2 results
      const items = wrapper.findAll('li')
      expect(items.length).toBe(2) // should show 2 results
    })
  })

  it('emits event when selecting item', async () => {
    wrapper = await mountComp()

    await wrapper.find('input').setValue('Item1')

    await flushPromises()
    await nextTick()

    await waitForDebounce(async () => {
      expect(searchFnMock).toHaveBeenCalledWith('Item1')

      const items = wrapper.findAll('li')

      await items[0]!.trigger('mousedown')
      expect(wrapper.emitted('select')).toBeTruthy() // should emit select event
    })
  })

  it('renders disabled items and prevents selection', async () => {
    wrapper = await mountComp()

    await wrapper.find('input').setValue('disabled')

    await flushPromises()
    await nextTick()

    await waitForDebounce(async () => {
      expect(searchFnMock).toHaveBeenCalledWith('disabled')
      const items = wrapper.findAll('li')
      expect(items.length).toBe(1) // should show 1 result
      expect(items[0]!.attributes('aria-disabled')).toBe('true')
      expect(items[0]!.classes()).toContain('cursor-not-allowed')

      await items[0]!.trigger('mousedown')
      expect(wrapper.emitted('select')).toBeFalsy() // Should not emit a select event
    })
  })

  it('displays no results when search returns no data', async () => {
    searchFnMock.mockResolvedValueOnce([])

    wrapper = await mountComp()

    await wrapper.find('input').setValue('No results')

    await flushPromises()
    await nextTick()

    await waitForDebounce(() => {
      expect(searchFnMock).toHaveBeenCalledWith('No results')

      const items = wrapper.findAll('li')
      expect(items.length).toBe(0)

      expect(wrapper.text()).toContain(enI18n.global.t('AsyncComboBox.noResults'))
    })
  })

  it('should debounce input correctly and avoid unnecessary calls', async () => {
    wrapper = await mountComp()

    // Set input value multiple times within the debounce timeout
    await wrapper.find('input').setValue('Item1')
    await wrapper.find('input').setValue('Item2')
    await wrapper.find('input').setValue('Item3')

    await flushPromises()
    await nextTick()

    await waitForDebounce(() => {
      // Assert that the search function was only called with the final input
      expect(searchFnMock).toHaveBeenCalledTimes(1)
      expect(searchFnMock).toHaveBeenCalledWith('Item3')
    })
  })
})
