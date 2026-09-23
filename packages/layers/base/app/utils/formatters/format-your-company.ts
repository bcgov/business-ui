import { cloneDeep, isEqual } from 'es-toolkit'

function createDefaultField<T>(val: T): ManageYourCompanyFieldState<T> {
  return {
    value: val,
    actions: []
  }
}

export function createDefaultYourCompany(
  business?: BusinessData | BusinessDataPublic,
  data?: BusinessDataExtended & NrState
): ManageYourCompanyFields {
  // create default object
  const fields: ManageYourCompanyFields = {
    // legalName: createDefaultField(business?.legalName ?? ''),
    legalType: createDefaultField(business?.legalType),
    namePreviousJurisdiction: createDefaultField(undefined),
    nameNewJurisdiction: createDefaultField(undefined),
    numberExpro: createDefaultField(undefined),
    numberPreviousJurisdiction: createDefaultField(undefined),
    outDate: createDefaultField(undefined),
    previousJurisdiction: createDefaultField(undefined),
    newJurisdiction: createDefaultField(undefined),
    nrNumber: createDefaultField(undefined),
    nameRequest: createDefaultField({ legalName: business?.legalName ?? '', nrNumber: '', changeToNumbered: false })
  }

  // return default object if no data
  if (!data) {
    return fields
  }

  // populate Name Request data if provided
  if (data.nameRequest) {
    const { legalName, nrNumber } = data.nameRequest
    const name = legalName?.trim()
    const number = nrNumber?.trim()

    // if (name) {
    //   fields.legalName = createDefaultField(name)
    // }

    fields.nrNumber = createDefaultField(number || undefined)
    fields.nameRequest = createDefaultField({
      legalName: name ?? '',
      nrNumber: number ?? ''
    } as NameRequestSchema)
  }

  // populate Continuation In data if provided
  if (data.continuationIn) {
    const contIn = data.continuationIn
    fields.namePreviousJurisdiction = createDefaultField(contIn.legalName)
    fields.numberPreviousJurisdiction = createDefaultField(contIn.identifier)
    fields.previousJurisdiction = createDefaultField({
      country: contIn.country,
      region: contIn.region
    })
  }

  // populate Continuation Out or Amalgamation Out data if provided
  const outData = data.continuationOut ?? data.amalgamationOut
  if (outData) {
    fields.nameNewJurisdiction = createDefaultField(outData.legalName)
    fields.outDate = createDefaultField(outData.date)
    fields.newJurisdiction = createDefaultField({
      country: outData.country,
      region: outData.region
    })
  }

  return fields
}

interface NrState {
  nameRequest?: {
    legalName: string
    // NB: this can be an empty string when staff update the name directly
    nrNumber?: string
  }
}

export function formatYourCompanySection(
  business?: BusinessData | BusinessDataPublic,
  originalState?: BusinessDataExtended & NrState,
  draftState?: BusinessDataExtended & NrState
): ManageYourCompanyState {
  // build default state
  const oldState = createDefaultYourCompany(business, originalState)

  if (!draftState) {
    return {
      old: oldState,
      new: cloneDeep(oldState)
    }
  }

  const newState = cloneDeep(oldState)

  const fields = Object.keys(newState) as (keyof ManageYourCompanyFields)[]

  for (const field of fields) {
    const oldField = oldState[field]
    const newField = newState[field]

    if (oldField && newField) {
      const isChanged = !isEqual(oldField.value, newField.value)

      if (isChanged) {
        newField.actions = [ActionType.CHANGED]
      } else {
        newField.actions = []
      }
    }
  }

  return {
    old: oldState,
    new: newState
  }
}
