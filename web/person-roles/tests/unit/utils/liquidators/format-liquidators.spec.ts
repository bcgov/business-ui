import { describe, it, expect, vi } from 'vitest'
import { getFakePerson, getFakeAddress } from '#e2e-utils'

vi.mock('@sbc-connect/nuxt-business-base/app/utils/date', () => ({
  getToday: () => '2023-10-27'
}))

function createPartyMock(
  nameData: PartySchema['name'],
  addressData: { delivery: ApiAddress, mailing: ApiAddress },
  actions: ActionType[] = [],
  id: string = ''
) {
  return {
    new: {
      id,
      actions,
      name: nameData,
      roles: [{ roleType: RoleTypeUi.LIQUIDATOR }],
      address: {
        mailingAddress: formatAddressUi(addressData.mailing),
        deliveryAddress: formatAddressUi(addressData.delivery),
        sameAs: false
      }
    }
  }
}

describe('format-liquidators', () => {
  describe('formatLiquidatorsApi', () => {
    it(`${LiquidateType.INTENT} - should correctly map form state and add common data to payload`, () => {
      const person = getFakePerson()
      const business = getFakePerson()
      const mailing = getFakeAddress()
      const delivery = getFakeAddress()
      const officeMailing = getFakeAddress()
      const officeDelivery = getFakeAddress()

      const newPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.givenName,
          middleName: person.middleInitial,
          lastName: person.familyName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing },
        [ActionType.ADDED]
      )

      const newBusiness = createPartyMock(
        {
          businessName: `${business.givenName} ${business.familyName}`,
          partyType: PartyType.ORGANIZATION,
          firstName: '',
          middleName: '',
          lastName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { mailing, delivery },
        [ActionType.ADDED]
      )

      const unchangedPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.givenName,
          middleName: person.middleInitial,
          lastName: person.familyName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing }
      )

      const mockTableState: TableBusinessState<PartySchema>[] = [
        newPerson,
        newBusiness,
        unchangedPerson
      ]

      const mockFormState = {
        recordsOffice: {
          mailingAddress: formatAddressUi(officeMailing),
          deliveryAddress: formatAddressUi(officeDelivery)
        }
      }

      const mockCommonData = {
        courtOrder: { fileNumber: '12345', hasPlanOfArrangement: true },
        documentId: '12345678'
      }

      const type = LiquidateType.INTENT

      const result = formatLiquidatorsApi(
        mockTableState,
        mockFormState as LiquidatorFormSchema,
        type,
        mockCommonData
      )

      expect(result.type).toBe(LiquidateType.INTENT)
      expect(result.changeOfLiquidatorsDate).toBe('2023-10-27')
      expect(result.documentId).toBe('12345678')
      expect(result.courtOrder).toBeDefined()
      expect(result.courtOrder!.fileNumber).toBe('12345')
      expect(result.courtOrder!.hasPlanOfArrangement).toEqual(true)

      expect(result.relationships).toHaveLength(2) // should filter out party with no actions

      expect(result.relationships![0]).toBeDefined()
      expect(result.relationships![0]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: person.givenName,
          businessName: ''
        },
        deliveryAddress: {
          streetAddress: delivery.streetAddress
        },
        mailingAddress: {
          streetAddress: mailing.streetAddress
        }
      })

      expect(result.relationships![1]).toBeDefined()
      expect(result.relationships![1]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: '',
          businessName: `${business.givenName} ${business.familyName}`
        },
        deliveryAddress: {
          streetAddress: delivery.streetAddress
        },
        mailingAddress: {
          streetAddress: mailing.streetAddress
        }
      })

      expect(result.offices).toBeDefined()
      expect(result.offices).toMatchObject({
        liquidationRecordsOffice: {
          deliveryAddress: {
            streetAddress: officeDelivery.streetAddress
          },
          mailingAddress: {
            streetAddress: officeMailing.streetAddress
          }
        }
      })
    })

    /* eslint-disable-next-line max-len */
    it(`${LiquidateType.APPOINT} - should correctly map form state, add common data to payload and exclude office addresses`, () => {
      const person = getFakePerson()
      const business = getFakePerson()
      const mailing = getFakeAddress()
      const delivery = getFakeAddress()
      const officeMailing = getFakeAddress()
      const officeDelivery = getFakeAddress()

      const newPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.givenName,
          middleName: person.middleInitial,
          lastName: person.familyName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing },
        [ActionType.ADDED]
      )

      const newBusiness = createPartyMock(
        {
          businessName: `${business.givenName} ${business.familyName}`,
          partyType: PartyType.ORGANIZATION,
          firstName: '',
          middleName: '',
          lastName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { mailing, delivery },
        [ActionType.ADDED]
      )

      const unchangedPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.givenName,
          middleName: person.middleInitial,
          lastName: person.familyName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing }
      )

      const mockTableState: TableBusinessState<PartySchema>[] = [
        newPerson,
        newBusiness,
        unchangedPerson
      ]

      const mockFormState = {
        recordsOffice: {
          mailingAddress: formatAddressUi(officeMailing),
          deliveryAddress: formatAddressUi(officeDelivery)
        }
      }

      const mockCommonData = {
        courtOrder: { fileNumber: '12345', hasPlanOfArrangement: true },
        documentId: '12345678'
      }

      const type = LiquidateType.APPOINT

      const result = formatLiquidatorsApi(
        mockTableState,
        mockFormState as LiquidatorFormSchema,
        type,
        mockCommonData
      )

      expect(result.type).toBe(LiquidateType.APPOINT)
      expect(result.changeOfLiquidatorsDate).toBe('2023-10-27')
      expect(result.documentId).toBe('12345678')
      expect(result.courtOrder).toBeDefined()
      expect(result.courtOrder!.fileNumber).toBe('12345')
      expect(result.courtOrder!.hasPlanOfArrangement).toEqual(true)

      expect(result.relationships).toHaveLength(2) // should filter out party with no actions

      expect(result.relationships![0]).toBeDefined()
      expect(result.relationships![0]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: person.givenName,
          businessName: ''
        },
        deliveryAddress: {
          streetAddress: delivery.streetAddress
        },
        mailingAddress: {
          streetAddress: mailing.streetAddress
        }
      })

      expect(result.relationships![1]).toBeDefined()
      expect(result.relationships![1]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: '',
          businessName: `${business.givenName} ${business.familyName}`
        },
        deliveryAddress: {
          streetAddress: delivery.streetAddress
        },
        mailingAddress: {
          streetAddress: mailing.streetAddress
        }
      })

      expect(result.offices).toBeUndefined()
    })

    describe(`${LiquidateType.ADDRESS}`, () => {
      const officeMailing = getFakeAddress()
      const officeDelivery = getFakeAddress()
      const currentOfficeMock: UiBaseAddressObj = {
        mailingAddress: formatAddressUi(officeMailing),
        deliveryAddress: formatAddressUi(officeDelivery),
        sameAs: false
      }
      it('should include offices when addresses have changed', () => {
        const changedMailing = { ...officeMailing, streetAddress: 'New Street 123' }

        const mockFormState = {
          recordsOffice: {
            mailingAddress: formatAddressUi(changedMailing),
            deliveryAddress: formatAddressUi(officeDelivery)
          }
        }

        const result = formatLiquidatorsApi(
          [],
          mockFormState as LiquidatorFormSchema,
          LiquidateType.ADDRESS,
          {},
          currentOfficeMock
        )

        expect(result.offices).toBeDefined()
        expect(result.offices?.liquidationRecordsOffice.mailingAddress.streetAddress).toBe('New Street 123')
      })

      it('should exclude offices when addresses are identical to current', () => {
        const mockFormState = {
          recordsOffice: {
            mailingAddress: formatAddressUi(officeMailing),
            deliveryAddress: formatAddressUi(officeDelivery)
          }
        }

        const result = formatLiquidatorsApi(
          [],
          mockFormState as LiquidatorFormSchema,
          LiquidateType.ADDRESS,
          {},
          currentOfficeMock
        )

        expect(result.offices).toBeUndefined()
      })

      it('should include formState offices even if currentLiquidationOffice is undefined', () => {
        const mockFormState = {
          recordsOffice: {
            mailingAddress: formatAddressUi(officeMailing),
            deliveryAddress: formatAddressUi(officeDelivery)
          }
        }

        const result = formatLiquidatorsApi(
          [],
          mockFormState as LiquidatorFormSchema,
          LiquidateType.ADDRESS,
          {},
          undefined
        )

        expect(result.offices).toBeDefined()
      })
    })
  })

  it('should exclude relationships property if none have changes/actions', () => {
    const officeMailing = getFakeAddress()
    const officeDelivery = getFakeAddress()

    const unchangedPerson = createPartyMock(
      {
        partyType: PartyType.PERSON,
        firstName: 'John',
        lastName: 'Doe',
        businessName: '',
        middleName: '',
        preferredName: '',
        hasPreferredName: false
      },
      { delivery: officeDelivery, mailing: officeMailing },
      []
    )

    const mockFormState = {
      recordsOffice: {
        mailingAddress: formatAddressUi({ ...officeMailing, streetAddress: 'Changed St' }),
        deliveryAddress: formatAddressUi(officeDelivery)
      }
    }

    const result = formatLiquidatorsApi(
      [unchangedPerson],
      mockFormState as LiquidatorFormSchema,
      LiquidateType.ADDRESS,
      {},
      {
        mailingAddress: formatAddressUi(officeMailing),
        deliveryAddress: formatAddressUi(officeDelivery),
        sameAs: false
      }
    )

    expect(result.offices).toBeDefined()
    expect(result.relationships).toBeUndefined()
    expect(Object.keys(result)).not.toContain('relationships')
  })
})
