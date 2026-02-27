import { describe, it, expect, vi } from 'vitest'
import { getFakePerson, getFakeAddress } from '#e2e-utils'

vi.mock('@sbc-connect/nuxt-business-base/app/utils/date', () => ({
  getToday: () => '2023-10-27'
}))

function createPartyMock(
  nameData: PartySchema['name'],
  addressData: { delivery: ConnectAddress, mailing: ConnectAddress },
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
        mailingAddress: addressData.mailing,
        deliveryAddress: addressData.delivery,
        sameAs: false
      }
    }
  }
}

function createOfficeTableMock(
  mailing: ConnectAddress,
  delivery: ConnectAddress,
  actions: ActionType[] = [],
  type: OfficeType = OfficeType.LIQUIDATION
): TableBusinessState<OfficesSchema> {
  const office = {
    type,
    actions,
    address: { mailingAddress: mailing, deliveryAddress: delivery, sameAs: false }
  }
  return {
    new: { ...office },
    old: { ...office, actions: [] }
  }
}

describe('format-liquidators', () => {
  const person = getFakePerson()
  const business = getFakePerson()
  const mailing = getFakeAddress()
  const delivery = getFakeAddress()
  const officeMailing = getFakeAddress()
  const officeDelivery = getFakeAddress()

  describe('formatLiquidatorsApi', () => {
    it(`${LiquidateType.INTENT} - should correctly format parties, offices and add common data to payload`, () => {
      const newPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.firstName,
          middleName: person.middleName,
          lastName: person.lastName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing },
        [ActionType.ADDED]
      )

      const mockOfficeTable = [createOfficeTableMock(officeMailing, officeDelivery)]

      const newBusiness = createPartyMock(
        {
          businessName: `${business.firstName} ${business.lastName}`,
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
          firstName: person.firstName,
          middleName: person.middleName,
          lastName: person.lastName,
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

      const mockCommonData = {
        courtOrder: { fileNumber: '12345', hasPlanOfArrangement: true },
        documentId: '12345678'
      }

      const type = LiquidateType.INTENT

      const result = formatLiquidatorsApi(
        mockTableState,
        type,
        mockCommonData,
        mockOfficeTable
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
          givenName: person.firstName,
          businessName: ''
        },
        deliveryAddress: {
          streetAddress: delivery.street
        },
        mailingAddress: {
          streetAddress: mailing.street
        }
      })

      expect(result.relationships![1]).toBeDefined()
      expect(result.relationships![1]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: '',
          businessName: `${business.firstName} ${business.lastName}`
        },
        deliveryAddress: {
          streetAddress: delivery.street
        },
        mailingAddress: {
          streetAddress: mailing.street
        }
      })

      expect(result.offices).toBeDefined()
      expect(result.offices).toMatchObject({
        liquidationRecordsOffice: {
          deliveryAddress: {
            streetAddress: officeDelivery.street
          },
          mailingAddress: {
            streetAddress: officeMailing.street
          }
        }
      })
    })

    it(`${LiquidateType.APPOINT} - should correctly format payload and exclude office addresses`, () => {
      const newPerson = createPartyMock(
        {
          partyType: PartyType.PERSON,
          firstName: person.firstName,
          middleName: person.middleName,
          lastName: person.lastName,
          businessName: '',
          preferredName: '',
          hasPreferredName: false
        },
        { delivery, mailing },
        [ActionType.ADDED]
      )

      const newBusiness = createPartyMock(
        {
          businessName: `${business.firstName} ${business.lastName}`,
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
          firstName: person.firstName,
          middleName: person.middleName,
          lastName: person.lastName,
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

      const mockCommonData = {
        courtOrder: { fileNumber: '12345', hasPlanOfArrangement: true },
        documentId: '12345678'
      }

      const mockOfficeTable = [createOfficeTableMock(officeMailing, officeDelivery)]

      const type = LiquidateType.APPOINT

      const result = formatLiquidatorsApi(
        mockTableState,
        type,
        mockCommonData,
        mockOfficeTable
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
          givenName: person.firstName,
          businessName: ''
        },
        deliveryAddress: {
          streetAddress: delivery.street
        },
        mailingAddress: {
          streetAddress: mailing.street
        }
      })

      expect(result.relationships![1]).toBeDefined()
      expect(result.relationships![1]).toMatchObject({
        actions: [ActionType.ADDED],
        entity: {
          givenName: '',
          businessName: `${business.firstName} ${business.lastName}`
        },
        deliveryAddress: {
          streetAddress: delivery.street
        },
        mailingAddress: {
          streetAddress: mailing.street
        }
      })

      expect(result.offices).toBeUndefined()
    })

    describe(`${LiquidateType.ADDRESS}`, () => {
      const officeMailing = getFakeAddress()
      const officeDelivery = getFakeAddress()

      it('should include offices when addresses have changed', () => {
        const mockOfficeTable = [
          createOfficeTableMock(officeMailing, officeDelivery, [ActionType.ADDRESS_CHANGED])
        ]

        const result = formatLiquidatorsApi(
          [],
          LiquidateType.ADDRESS,
          {},
          mockOfficeTable
        )

        expect(result.offices).toBeDefined()
        expect(result.offices?.liquidationRecordsOffice.mailingAddress.streetAddress).toBe(officeMailing.street)
      })

      it('should exclude offices when addresses are identical to current', () => {
        const mockOfficeTable = [
          createOfficeTableMock(officeMailing, officeDelivery, [])
        ]

        const result = formatLiquidatorsApi(
          [],
          LiquidateType.ADDRESS,
          {},
          mockOfficeTable
        )

        expect(result.offices).toBeUndefined()
      })
    })
  })

  it('should exclude relationships property if none have changes/actions', () => {
    const officeMailing = getFakeAddress()
    const officeDelivery = getFakeAddress()

    const mockOfficeTable = [
      createOfficeTableMock(officeMailing, officeDelivery, [ActionType.ADDED])
    ]

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

    const result = formatLiquidatorsApi(
      [unchangedPerson],
      LiquidateType.ADDRESS,
      {},
      mockOfficeTable
    )

    expect(result.offices).toBeDefined()
    expect(result.relationships).toBeUndefined()
    expect(Object.keys(result)).not.toContain('relationships')
  })

  it('should remove offices property if LIQUIDATION office is missing from the table array', () => {
    const result = formatLiquidatorsApi([], LiquidateType.INTENT, {}, [])

    expect(result.offices).toBeUndefined()
  })
})
