import { describe, it, expect } from 'vitest'
import { merge, cloneDeep } from 'es-toolkit'

describe('formatOfficesSection', () => {
  const mockDeliveryAddress: ApiAddress = {
    id: 3226305,
    addressCity: 'Vancouver',
    addressCountry: 'CA',
    addressRegion: 'BC',
    addressType: 'delivery',
    deliveryInstructions: 'Deliver to front desk',
    postalCode: 'V6M 3Y3',
    streetAddress: '5670 Yew Street',
    streetAddressAdditional: 'Suite 100'
  }

  const mockMailingAddress: ApiAddress = {
    id: 3226301,
    addressCity: 'Vancouver',
    addressCountry: 'CA',
    addressRegion: 'BC',
    addressType: 'mailing',
    deliveryInstructions: '',
    postalCode: 'V6M 3Y3',
    streetAddress: '5670 Yew Street',
    streetAddressAdditional: 'Suite 100'
  }

  const mockOriginalOffice: ApiBaseAddressObj = {
    deliveryAddress: mockDeliveryAddress,
    mailingAddress: mockMailingAddress
  }

  const mockOriginalAddresses: ApiEntityOfficeAddress = {
    registeredOffice: mockOriginalOffice,
    recordsOffice: mockOriginalOffice
  }

  it('should not modify original when draftAddresses is undefined', () => {
    const result = formatOfficesSection(mockOriginalAddresses, undefined)

    expect(result).toHaveLength(2)
    expect(result[0]!.old).toBeDefined()
    expect(result[0]!.new.actions).toEqual([])
    expect(result[0]!.old!.type).toBe(OfficeType.REGISTERED)
    expect(result[0]!.new.type).toBe(OfficeType.REGISTERED)
    expect(result[0]!.new.address.deliveryAddress.street).toBe('5670 Yew Street')
    expect(result[0]!.new.address.mailingAddress.street).toBe('5670 Yew Street')
    expect(result[0]!.new.address.sameAs).toBe(false)
  })

  it('should keep actions empty when draft matches original', () => {
    const draftAddresses: ApiEntityOfficeAddress = {
      ...mockOriginalAddresses
    }

    const result = formatOfficesSection(mockOriginalAddresses, draftAddresses)

    expect(result).toHaveLength(2)
    expect(result[0]!.new.actions).toEqual([])
    expect(result[0]!.new.address.deliveryAddress.street).toBe('5670 Yew Street')
    expect(result[1]!.new.actions).toEqual([])
    expect(result[0]!.new.address.sameAs).toBe(false)
  })

  it('should add CHANGED action when draft does not match original', () => {
    const updatedDeliveryAddress: ApiAddress = {
      ...mockDeliveryAddress,
      streetAddress: '9999 Changed Street'
    }

    const draftAddresses: ApiEntityOfficeAddress = {
      registeredOffice: {
        ...mockOriginalOffice,
        deliveryAddress: updatedDeliveryAddress
      },
      recordsOffice: mockOriginalOffice
    }

    const result = formatOfficesSection(mockOriginalAddresses, draftAddresses)

    expect(result).toHaveLength(2)
    expect(result[0]!.new.actions).toEqual([ActionType.CHANGED])
    expect(result[0]!.new.address.deliveryAddress.street).toBe('9999 Changed Street')
    expect(result[1]!.new.actions).toEqual([])
  })

  it('should keep existing record when original office is missing from draft', () => {
    // draft has registeredOffice, but recordsOffice is missing
    const draftAddresses: ApiEntityOfficeAddress = {
      registeredOffice: mockOriginalOffice
    }

    const result = formatOfficesSection(mockOriginalAddresses, draftAddresses)

    expect(result).toHaveLength(2)
    expect(result[0]!.new.actions).toEqual([])
    expect(result[1]!.old).toBeDefined()
    expect(result[1]!.new.actions).toEqual([])
    expect(result[1]!.new.type).toBe(OfficeType.RECORDS)
  })

  it('should add ADDED action for new draft offices that do not exist in original', () => {
    const newOfficeAddress: ApiBaseAddressObj = {
      deliveryAddress: {
        ...mockDeliveryAddress,
        streetAddress: '123 New Business Rd'
      },
      mailingAddress: {
        ...mockMailingAddress,
        streetAddress: '123 New Business Rd'
      }
    }

    const draftAddresses: ApiEntityOfficeAddress = {
      ...mockOriginalAddresses,
      custodialOffice: newOfficeAddress
    }

    const result = formatOfficesSection(mockOriginalAddresses, draftAddresses)

    expect(result).toHaveLength(3)
    expect(result[0]!.new.actions).toEqual([])
    expect(result[1]!.new.actions).toEqual([])

    expect(result[2]!.old).toBeUndefined()
    expect(result[2]!.new.type).toBe(OfficeType.CUSTODIAL)
    expect(result[2]!.new.actions).toEqual([ActionType.ADDED])
    expect(result[2]!.new.address.deliveryAddress.street).toBe('123 New Business Rd')
  })

  it('should ignore null or undefined values in original and draft objects', () => {
    const rawOriginalWithNulls: ApiEntityOfficeAddress = {
      registeredOffice: mockOriginalOffice,
      recordsOffice: undefined
    }

    const result = formatOfficesSection(rawOriginalWithNulls, undefined)

    expect(result).toHaveLength(1)
    expect(result[0]!.new.type).toBe(OfficeType.REGISTERED)
  })
})

describe('formatOfficesApi', () => {
  const mockDeliveryAddress = {
    id: '3226305',
    street: '5670 Yew Street',
    streetAdditional: 'Suite 100',
    city: 'Vancouver',
    region: 'BC',
    postalCode: 'V6M 3Y3',
    country: 'CA',
    locationDescription: 'Deliver to front desk'
  }

  const mockMailingAddress = {
    id: '3226301',
    street: '5670 Yew Street',
    streetAdditional: 'Suite 100',
    city: 'Vancouver',
    region: 'BC',
    postalCode: 'V6M 3Y3',
    country: 'CA',
    locationDescription: 'Deliver to front desk'
  }

  const mockUiBaseAddressObj: UiBaseAddressObj = {
    deliveryAddress: mockDeliveryAddress,
    mailingAddress: mockMailingAddress,
    sameAs: true
  }

  const createMockOfficeState = (
  type: OfficeType,
  actions: ActionType[] = [],
  addressOverrides?: Partial<UiBaseAddressObj>
): TableBusinessState<OfficeSchema> => {
  // Use deep merge instead of shallow spread
  const address = merge(cloneDeep(mockUiBaseAddressObj), addressOverrides ?? {})

  return {
    old: {
      id: '123',
      type,
      address,
      isEditing: false,
      actions: []
    },
    new: {
      id: '123',
      type,
      address,
      isEditing: false,
      actions
    }
  }
}

  describe('formatOfficesApi', () => {
    it('should return undefined if no offices have changes', () => {
      const offices = [
        createMockOfficeState(OfficeType.REGISTERED, []),
        createMockOfficeState(OfficeType.RECORDS, [])
      ]

      const result = formatOfficesApi(offices)

      expect(result).toBeUndefined()
    })

    it('should only include offices that have active actions', () => {
      const offices = [
        createMockOfficeState(OfficeType.REGISTERED, [ActionType.CHANGED]),
        createMockOfficeState(OfficeType.RECORDS, [])
      ]

      const result = formatOfficesApi(offices)

      expect(result).toBeDefined()
      expect(Object.keys(result!)).toEqual([OfficeType.REGISTERED])
      expect(result!.registeredOffice).toBeDefined()
      expect(result!.recordsOffice).toBeUndefined()
    })

    it('should remove id from newly added offices', () => {
      const addedOffice = createMockOfficeState(
        OfficeType.CUSTODIAL,
        [ActionType.ADDED],
        {
          deliveryAddress: { ...mockDeliveryAddress, id: 'temp-uuid-123' },
          mailingAddress: { ...mockMailingAddress, id: 'temp-uuid-456' }
        }
      )

      

      const result = formatOfficesApi([addedOffice])

      console.log(result!.custodialOffice)

      expect(result).toBeDefined()
      expect(result!.custodialOffice).toBeDefined()
      expect(result!.custodialOffice?.deliveryAddress?.id).toBeUndefined()
      expect(result!.custodialOffice?.mailingAddress?.id).toBeUndefined()
      expect(result!.custodialOffice?.deliveryAddress?.streetAddress).toBe('5670 Yew Street')
    })
  })
})