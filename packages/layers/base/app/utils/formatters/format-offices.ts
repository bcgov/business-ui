import { merge, cloneDeep } from 'es-toolkit'

const NON_EDITABLE_FIELDS = ['isEditing', 'actions', 'id'] as const

export function formatOfficesSection(
  originalAddresses?: ApiEntityOfficeAddress,
  draftAddresses?: ApiEntityOfficeAddress,
  officeTypes?: OfficeType[]
): TableBusinessState<OfficeSchema>[] {
  const originals = originalAddresses ?? {}

  // Helper to format OfficeSchema from an api office object
  function processItem(type: OfficeType, office?: ApiBaseAddressObj): OfficeSchema {
    const address = formatBaseAddressUi(office)
    const defaults = createDefaultOffice({ type })

    return merge(cloneDeep(defaults), {
      type,
      address
    })
  }

  // Helper to get all office types from an api response
  // Filters out null, undefined or office types excluded by the officeTypes param
  function getTypes(addresses: ApiEntityOfficeAddress): OfficeType[] {
    return (Object.keys(addresses) as OfficeType[])
      .filter((type) => {
        const hasValue = Boolean(addresses[type])
        const isAllowed = !officeTypes || officeTypes.includes(type)
        return hasValue && isAllowed
      })
  }

  const originalTypes = getTypes(originals)

  // 1. If no draft state exists, format and return only originals
  if (draftAddresses === undefined) {
    return originalTypes.map((type) => {
      const item = processItem(type, originals[type])
      return {
        old: item,
        new: cloneDeep(item)
      }
    })
  }

  // 2. Process draft addresses
  const draftTypes = getTypes(draftAddresses)

  const formattedOriginals: TableBusinessState<OfficeSchema>[] = originalTypes.map((type) => {
    const oldItem = processItem(type, originals[type])
    const draftOffice = draftAddresses[type]

    // If a draft office type matching an original type is found, do equality check and add actions
    if (draftOffice) {
      const newItem = processItem(type, draftOffice)
      const isChanged = !isEqualOmit(oldItem, newItem, NON_EDITABLE_FIELDS)

      return {
        old: oldItem,
        new: {
          ...newItem,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    }

    // Keep existing record if type is in original but not in draft
    // NB: May need update to handle delete/remove
    return {
      old: oldItem,
      new: cloneDeep(oldItem)
    }
  })

  // 3. Process new addresses (exists in draft but not original)
  const addedTypes = draftTypes.filter(type => !originals[type])

  const addedDrafts: TableBusinessState<OfficeSchema>[] = addedTypes.map((type) => {
    const item = processItem(type, draftAddresses[type])

    return {
      old: undefined,
      new: {
        ...item,
        actions: [ActionType.ADDED]
      }
    }
  })

  return [...formattedOriginals, ...addedDrafts]
}

export function formatOfficesApi(
  offices: TableBusinessState<OfficeSchema>[]
): ApiEntityOfficeAddress | undefined {
  // Return undefined if no changes exist
  if (!offices.some(office => office.new.actions.length > 0)) {
    return undefined
  }

  const result: Partial<ApiEntityOfficeAddress> = {}

  offices
    .filter(office => office.new.actions.length > 0) // only include offices where changes have been made
    .forEach((office) => {
      const { type, address } = office.new
      result[type] = formatOfficeApi(address)
    })

  return result as ApiEntityOfficeAddress
}
