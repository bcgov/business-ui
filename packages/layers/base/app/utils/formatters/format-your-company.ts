import { cloneDeep, isEqual } from 'es-toolkit'

function createDefaultField<T>(val: T): ManageYourCompanyFieldState<T> {
  return {
    value: val,
    actions: []
  }
}

export function createDefaultYourCompany(
  business?: BusinessData | BusinessDataPublic,
  data?: BusinessDataExtended & NrState,
  filingType?: FilingType
): ManageYourCompanyFields {
  // create default object
  const fields: ManageYourCompanyFields = {
    legalType: createDefaultField(business?.legalType),
    namePreviousJurisdiction: createDefaultField(undefined),
    nameNewJurisdiction: createDefaultField(undefined),
    numberExpro: createDefaultField(undefined),
    numberPreviousJurisdiction: createDefaultField(undefined),
    outDate: createDefaultField(undefined),
    previousJurisdiction: createDefaultField(undefined),
    newJurisdiction: createDefaultField(undefined),
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

    fields.nameRequest = createDefaultField({
      legalName: name ?? '',
      nrNumber: number ?? ''
    } as NameRequestSchema)
  }

  // populate Continuation In data if provided and matches filing type
  if (data.continuationIn && (!filingType || filingType === FilingType.CONTINUATION_IN)) {
    const contIn = data.continuationIn
    fields.namePreviousJurisdiction = createDefaultField(contIn.legalName)
    fields.numberPreviousJurisdiction = createDefaultField(contIn.identifier)
    fields.previousJurisdiction = createDefaultField({
      country: contIn.country,
      region: contIn.region
    })

    if (contIn.expro) {
      fields.numberExpro = createDefaultField(contIn.expro.identifier)
    }
  }

  // populate Continuation Out or Amalgamation Out data if provided and matches filing type
  const isOutFiling = !filingType || filingType === FilingType.CONTINUATION_OUT || filingType === FilingType.AMALGAMATION_OUT
  const outData = data.continuationOut ?? data.amalgamationOut

  if (outData && isOutFiling) {
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
    legalType?: CorpTypeCd // required in name request schema
  }
}

export function formatYourCompanySection(
  business?: BusinessData | BusinessDataPublic,
  originalState?: BusinessDataExtended & NrState,
  draftState?: BusinessDataExtended & NrState,
  filingType?: FilingType
): ManageYourCompanyState {
  // build default state
  const oldState = createDefaultYourCompany(business, originalState, filingType)

  const hasDraftData = draftState && Object.values(draftState).some(val => val !== undefined)

  if (!hasDraftData) {
    return {
      old: oldState,
      new: cloneDeep(oldState)
    }
  }

  const newState = createDefaultYourCompany(business, draftState, filingType)

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

// helper to determin if a 'Your Company' field has any changes
function hasChange(field?: { actions?: string[] }): boolean {
  return (field?.actions?.length ?? 0) > 0
}

export function formatCorrectYourCompanyApi(
  state: ManageYourCompanyState,
  businessExtended?: BusinessDataExtended,
  filingType?: FilingType
): Partial<BusinessDataExtended & NrState> {
  let result: Partial<BusinessDataExtended & NrState> = {}

  if (hasChange(state.new.nameRequest)) {
    const nrValue = state.new.nameRequest?.value
    
    result.nameRequest = {
      legalName: nrValue?.legalName ?? '',
      legalType: state.new.legalType.value, // required in json schema - TODO/FUTURE: update so this populates from the name request response
      // Only include nrNumber if it's provided - can be empty
      ...(nrValue?.nrNumber ? { nrNumber: nrValue.nrNumber } : {})
    }
  }

  switch (filingType) {
    case FilingType.CONTINUATION_IN: {
      // check if any continuation in data was changed
      const hasContinuationInChange = [
        state.new.previousJurisdiction,
        state.new.numberPreviousJurisdiction,
        state.new.namePreviousJurisdiction,
        state.new.numberExpro
      ].some(hasChange)

      if (hasContinuationInChange) {
        const exproNumber = state.new.numberExpro?.value || businessExtended?.continuationIn?.expro?.identifier
        const exproName = businessExtended?.continuationIn?.expro?.legalName // not editable in UI - include from extended data

        result.continuationIn = {
          country: state.new.previousJurisdiction?.value?.country ?? '',
          region: state.new.previousJurisdiction?.value?.region ?? null,
          identifier: state.new.numberPreviousJurisdiction?.value ?? '',
          legalName: state.new.namePreviousJurisdiction?.value ?? '',
          incorporationDate: businessExtended?.continuationIn?.incorporationDate ?? '', // not editable in UI - include from extended data
          ...(exproNumber || exproName ? { // only include if in initial payload
            expro: {
              identifier: exproNumber ?? '',
              legalName: exproName ?? ''
            }
          } : {})
        }
      }
      break
    }
    case FilingType.CONTINUATION_OUT: {
      // check if any coninuation out data was changed
      const hasContinuationOutChange = [
        state.new.newJurisdiction,
        state.new.outDate,
        state.new.nameNewJurisdiction
      ].some(hasChange)

      if (hasContinuationOutChange) {
        result.continuationOut = {
          country: state.new.newJurisdiction?.value?.country ?? '',
          region: state.new.newJurisdiction?.value?.region ?? null,
          date: state.new.outDate?.value ?? '',
          legalName: state.new.nameNewJurisdiction?.value ?? '',
        }
      }
      break
    }
    case FilingType.AMALGAMATION_OUT: {
      // check if any amalgamation out data was changed
      const hasAmalgamationOutChange = [
        state.new.newJurisdiction,
        state.new.outDate,
        state.new.nameNewJurisdiction
      ].some(hasChange)

      if (hasAmalgamationOutChange) {
        result.amalgamationOut = {
          country: state.new.newJurisdiction?.value?.country ?? '',
          region: state.new.newJurisdiction?.value?.region ?? null,
          date: state.new.outDate?.value ?? '',
          legalName: state.new.nameNewJurisdiction?.value ?? ''
        }
      }
      break
    }
  }

  return result
}