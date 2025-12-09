import { describe, test, expect } from 'vitest'

describe('officer-helpers utils', () => {
  describe('UI_ROLE_TO_API_ROLE_MAP', () => {
    test('should correctly map enum ui values to string api values', () => {
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.CEO]).toBe('CEO')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.VP]).toBe('Vice President')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.PRESIDENT]).toBe('President')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.CFO]).toBe('CFO')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.CHAIR]).toBe('Chair')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.TREASURER]).toBe('Treasurer')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.SECRETARY]).toBe('Secretary')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.ASSISTANT_SECRETARY]).toBe('Assistant Secretary')
      expect(UI_ROLE_TO_API_ROLE_MAP[OfficerRole.OTHER]).toBe('Other')
    })
  })

  describe('API_ROLE_TO_UI_ROLE_MAP', () => {
    test('should correctly map api string values to ui enum values', () => {
      expect(API_ROLE_TO_UI_ROLE_MAP['ceo']).toBe(OfficerRole.CEO)
      expect(API_ROLE_TO_UI_ROLE_MAP['cfo']).toBe(OfficerRole.CFO)
      expect(API_ROLE_TO_UI_ROLE_MAP['president']).toBe(OfficerRole.PRESIDENT)
      expect(API_ROLE_TO_UI_ROLE_MAP['vice president']).toBe(OfficerRole.VP)
      expect(API_ROLE_TO_UI_ROLE_MAP['chair']).toBe(OfficerRole.CHAIR)
      expect(API_ROLE_TO_UI_ROLE_MAP['treasurer']).toBe(OfficerRole.TREASURER)
      expect(API_ROLE_TO_UI_ROLE_MAP['secretary']).toBe(OfficerRole.SECRETARY)
      expect(API_ROLE_TO_UI_ROLE_MAP['assistant secretary']).toBe(OfficerRole.ASSISTANT_SECRETARY)
      expect(API_ROLE_TO_UI_ROLE_MAP['other']).toBe(OfficerRole.OTHER)
    })
  })

  describe('formatOfficerPayload', () => {
    const baseOfficer = {
      id: '123',
      firstName: 'Test',
      lastName: 'User',
      preferredName: '',
      middleName: '',
      deliveryAddress: {
        street: '123 Delivery St',
        city: 'Victoria',
        postalCode: 'V8V 8V8',
        country: 'CA',
        region: 'BC'
      },
      mailingAddress: {},
      roles: [
        { roleType: OfficerRole.VP, appointmentDate: '2023-01-01', cessationDate: null, roleClass: 'OFFICER' }
      ]
    }

    const baseState = [
      { new: baseOfficer }
    ] as unknown as OfficerTableState[]

    test('should format the payload correctly', () => {
      const result = formatOfficerPayload(baseState).changeOfOfficers
      const officerPayload = result.relationships[0]

      expect(result.relationships).toHaveLength(1)
      expect(officerPayload!.entity.givenName).toBe('Test')
      expect(officerPayload!.entity.identifier).toBe('123')
    })

    test('should correctly map roleTypes', () => {
      const result = formatOfficerPayload(baseState).changeOfOfficers
      const officerRoles = result.relationships[0]!.roles

      expect(officerRoles[0]!.roleType).toBe('Vice President')
    })

    test('should NOT include mailingAddress if it is incomplete', () => {
      const result = formatOfficerPayload(baseState).changeOfOfficers
      const officerPayload = result.relationships[0]

      expect(officerPayload).not.toHaveProperty('mailingAddress')
    })

    test('should INCLUDE mailingAddress if it is complete and valid', () => {
      const modifiedOfficerState = {
        new: {
          ...baseOfficer,
          mailingAddress: {
            street: '456 Mail St', city: 'Vancouver', postalCode: 'V6B 4N2', country: 'CA', region: 'BC'
          }
        }
      }

      const result = formatOfficerPayload([modifiedOfficerState] as OfficerTableState[]).changeOfOfficers
      const officerPayload = result.relationships[0]

      expect(officerPayload).toHaveProperty('mailingAddress')
      expect(officerPayload!.mailingAddress?.streetAddress).toBe('456 Mail St')
    })

    test('should handle multiple officers in the payload', () => {
      const secondOfficer = { ...baseOfficer, id: '456', firstName: 'Another' }
      const multiState = [
        { new: baseOfficer },
        { new: secondOfficer }
      ] as unknown as OfficerTableState[]

      const result = formatOfficerPayload(multiState).changeOfOfficers

      expect(result.relationships).toHaveLength(2)
      expect(result.relationships[0]!.entity.givenName).toBe('Test')
      expect(result.relationships[1]!.entity.givenName).toBe('Another')
    })

    test('should exclude officer if new and old values are the same', () => {
      const unchangedOfficerState = {
        new: baseOfficer,
        old: { ...baseOfficer }
      }

      const payload = formatOfficerPayload([unchangedOfficerState] as OfficerTableState[]).changeOfOfficers

      expect(payload.relationships).toHaveLength(0)
    })

    test('should include only new and edited officers', () => {
      const unchangedOfficer = { new: baseOfficer, old: { ...baseOfficer } }

      const newOfficer = { new: { ...baseOfficer, id: '999', firstName: 'New' } }

      const changedOfficer = {
        old: baseOfficer,
        new: { ...baseOfficer, firstName: 'Changed First', lastName: 'Changed Last' }
      }

      const state = [unchangedOfficer, newOfficer, changedOfficer] as OfficerTableState[]
      const result = formatOfficerPayload(state).changeOfOfficers

      expect(result.relationships).toHaveLength(2)

      expect(result.relationships.some(r => r!.entity.givenName === 'Test')).toBe(false)

      expect(result.relationships.some(r => r!.entity.givenName === 'New')).toBe(true)
      expect(result.relationships.some(r => r!.entity.familyName === 'Changed Last')).toBe(true)
    })
  })

  describe('getNewOfficer', () => {
    test('should return a valid Officer object with correct default values', () => {
      const newOfficer = getNewOfficer()

      expect(newOfficer).toBeTypeOf('object')
      expect(newOfficer.firstName).toBe('')
      expect(newOfficer.lastName).toBe('')
      expect(newOfficer.roles).toEqual([])
      expect(newOfficer.sameAsDelivery).toBe(false)

      expect(newOfficer.deliveryAddress.country).toBe('CA')
      expect(newOfficer.deliveryAddress.street).toBe('')
      expect(newOfficer.mailingAddress.country).toBe('CA')
    })
  })

  describe('getOfficerStateDiff', () => {
    const baseOfficer: Officer = getNewOfficer()
    baseOfficer.id = '1'
    baseOfficer.firstName = 'Carol'
    baseOfficer.lastName = 'Pilbasian'
    baseOfficer.roles = [{ roleType: 'CEO' }] as OfficerRoleObj[]

    test('should return an empty array when there are no differences', () => {
      const identicalOfficer = JSON.parse(JSON.stringify(baseOfficer))
      const diff = getOfficerStateDiff(baseOfficer, identicalOfficer)
      expect(diff).toEqual([])
    })

    test('should detect a change in the "name" section', () => {
      const modifiedOfficer = { ...baseOfficer, firstName: 'Caroline' }
      const diff = getOfficerStateDiff(baseOfficer, modifiedOfficer)

      expect(diff).toHaveLength(1)
      expect(diff).toContain('name')
    })

    test('should detect a change in the "roles" section', () => {
      const modifiedOfficer = { ...baseOfficer, roles: [{ roleType: 'President' }] } as unknown as Officer
      const diff = getOfficerStateDiff(baseOfficer, modifiedOfficer)

      expect(diff).toHaveLength(1)
      expect(diff).toContain('roles')
    })

    test('should detect a change in the "address" section', () => {
      const modifiedOfficer = {
        ...baseOfficer,
        deliveryAddress: { ...baseOfficer.deliveryAddress, street: '123 New Street' }
      }
      const diff = getOfficerStateDiff(baseOfficer, modifiedOfficer)

      expect(diff).toHaveLength(1)
      expect(diff).toContain('address')
    })

    test('should detect multiple changes across different sections', () => {
      const modifiedOfficer = {
        ...baseOfficer,
        lastName: 'New-Lastname',
        roles: [...baseOfficer.roles, { roleType: 'CFO' }] as OfficerRoleObj[]
      }
      const diff = getOfficerStateDiff(baseOfficer, modifiedOfficer)

      expect(diff).toHaveLength(2)
      expect(diff).toContain('name')
      expect(diff).toContain('roles')
    })

    test('should not detect a change when values are identical', () => {
      const officerWithNewRoleArray = {
        ...baseOfficer,
        roles: [{ roleType: 'CEO' }] as OfficerRoleObj[]
      }
      const diff = getOfficerStateDiff(baseOfficer, officerWithNewRoleArray)
      expect(diff).toEqual([])
    })
  })
})
