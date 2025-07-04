import { describe, test, expect } from 'vitest'

describe('Officer formatter utils', () => {
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
      { state: { officer: baseOfficer, actions: [] }, history: [] }
    ] as unknown as OfficerTableState[]

    test('should format the payload correctly', () => {
      const result = formatOfficerPayload(baseState)
      const officerPayload = result.relationships[0]

      expect(result.relationships).toHaveLength(1)
      expect(officerPayload!.entity.givenName).toBe('Test')
      expect(officerPayload!.entity.identifier).toBe('123')
    })

    test('should correctly map roleTypes', () => {
      const result = formatOfficerPayload(baseState)
      const officerRoles = result.relationships[0]!.roles

      expect(officerRoles[0]!.roleType).toBe('Vice President')
    })

    test('should NOT include mailingAddress if it is incomplete', () => {
      const result = formatOfficerPayload(baseState)
      const officerPayload = result.relationships[0]

      expect(officerPayload).not.toHaveProperty('mailingAddress')
    })

    test('should INCLUDE mailingAddress if it is complete and valid', () => {
      const modifiedOfficer = {
        ...baseOfficer,
        mailingAddress: { street: '456 Mail St', city: 'Vancouver', postalCode: 'V6B 4N2', country: 'CA', region: 'BC' }
      } as unknown as Officer
      const modifiedState: OfficerTableState[] = [
        { state: { officer: modifiedOfficer, actions: [] }, history: [] }
      ]

      const result = formatOfficerPayload(modifiedState)
      const officerPayload = result.relationships[0]

      expect(officerPayload).toHaveProperty('mailingAddress')
      expect(officerPayload!.mailingAddress?.streetAddress).toBe('456 Mail St')
    })

    test('should handle multiple officers in the payload', () => {
      const secondOfficer = { ...baseOfficer, id: '456', firstName: 'Another' }
      const multiState = [
        { state: { officer: baseOfficer, actions: [] }, history: [] },
        { state: { officer: secondOfficer, actions: [] }, history: [] }
      ] as unknown as OfficerTableState[]

      const result = formatOfficerPayload(multiState)

      expect(result.relationships).toHaveLength(2)
      expect(result.relationships[0]!.entity.givenName).toBe('Test')
      expect(result.relationships[1]!.entity.givenName).toBe('Another')
    })
  })
})
