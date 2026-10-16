import { describe, it, expect } from 'vitest'

interface TestFormState {
  folio: { folioNumber: string }
  authorization: { isAuthorized: boolean }
}

const getDefaults = (): TestFormState => ({
  folio: { folioNumber: '' },
  authorization: { isAuthorized: false }
})

describe('useFilingFormState', () => {
  it('should start from the defaults with an empty snapshot', () => {
    const { formState, initialFormState, initializing } = useFilingFormState(getDefaults)

    expect(formState).toEqual(getDefaults())
    expect(initialFormState.value).toEqual({})
    expect(initializing.value).toBe(false)
  })

  it('should snapshot a deep clone of the current form state', async () => {
    const { formState, initialFormState, initializing, snapshotInitialState } = useFilingFormState(getDefaults)
    initializing.value = true
    formState.folio.folioNumber = 'FOLIO-99'

    await snapshotInitialState()

    expect(initialFormState.value).toEqual(formState)
    expect(initialFormState.value).not.toBe(formState)
    expect(initialFormState.value.folio).not.toBe(formState.folio)
    expect(initializing.value).toBe(false)
  })

  it('should not track changes made after the snapshot', async () => {
    const { formState, initialFormState, snapshotInitialState } = useFilingFormState(getDefaults)

    await snapshotInitialState()
    formState.folio.folioNumber = 'CHANGED'

    expect(initialFormState.value.folio.folioNumber).toBe('')
  })

  it('should restore the defaults and re-baseline on reset', () => {
    const { formState, initialFormState, resetFormState } = useFilingFormState(getDefaults)
    formState.folio.folioNumber = 'FOLIO-99'
    formState.authorization.isAuthorized = true

    resetFormState()

    expect(formState).toEqual(getDefaults())
    expect(initialFormState.value).toEqual(getDefaults())
    expect(initialFormState.value).not.toBe(formState)
  })

  it('should rebuild the defaults on each reset rather than share them', () => {
    const { formState, resetFormState } = useFilingFormState(getDefaults)

    resetFormState()
    formState.folio.folioNumber = 'FOLIO-99'
    resetFormState()

    expect(formState.folio.folioNumber).toBe('')
  })
})
