import { describe, it, expect } from 'vitest'

import { CORRECTION_DETAIL_COMMENT_MAX_LENGTH } from '../../../app/utils/schemas/correction'

/**
 * Unit tests for the correction store.
 *
 * Note: The correction store relies heavily on composables (useFiling, useManageParties, etc.)
 * which are deeply integrated with the Nuxt runtime. Full store init/submit integration
 * testing is covered by the e2e tests in tests/e2e/specs/correction/.
 *
 * These unit tests focus on:
 * - Schema defaults and validation (via getCorrectionSchema)
 * - Exported types and enums used by the store
 */

describe('Correction Store — Types & Enums', () => {
  describe('CorrectionType', () => {
    it('should have CLIENT and STAFF values', () => {
      expect(CorrectionType.CLIENT).toBe('CLIENT')
      expect(CorrectionType.STAFF).toBe('STAFF')
    })
  })

  describe('ActionType normalization expectations', () => {
    it('should have CORRECTED action type available', () => {
      expect(ActionType.CORRECTED).toBeDefined()
    })

    it('should have all edit-type action types that map to CORRECTED in corrections', () => {
      // These action types from the API are normalized to CORRECTED in the correction store
      expect(ActionType.ADDRESS_CHANGED).toBeDefined()
      expect(ActionType.NAME_CHANGED).toBeDefined()
      expect(ActionType.CORRECTED).toBeDefined()
    })

    it('should have action types that pass through unchanged', () => {
      // These action types are NOT normalized (they stay as-is)
      expect(ActionType.ADDED).toBeDefined()
      expect(ActionType.REMOVED).toBeDefined()
    })
  })
})

describe('Correction Schema', () => {
  describe('Staff schema defaults', () => {
    it('should parse with correct defaults for staff', () => {
      const schema = getCorrectionSchema(true)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        comment: { detail: '' },
        documentDelivery: { completingPartyEmail: '' },
        courtOrder: { hasPoa: false, courtOrderNumber: '' },
        staffPayment: {
          option: StaffPaymentOption.NONE,
          bcolAccountNumber: '',
          datNumber: '',
          routingSlipNumber: '',
          folioNumber: '',
          isPriority: false
        }
      })
    })

    it('should NOT include client-only fields (certify, folio)', () => {
      const schema = getCorrectionSchema(true)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).not.toHaveProperty('certify')
      expect(result.data).not.toHaveProperty('folio')
    })
  })

  describe('Client schema defaults', () => {
    it('should parse with correct defaults for client', () => {
      const schema = getCorrectionSchema(false)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        comment: { detail: '' },
        documentDelivery: { completingPartyEmail: '' },
        certify: { isCertified: false, legalName: '' },
        folio: { folioNumber: '' }
      })
    })

    it('should NOT include staff-only fields (courtOrder, staffPayment)', () => {
      const schema = getCorrectionSchema(false)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data).not.toHaveProperty('courtOrder')
      expect(result.data).not.toHaveProperty('staffPayment')
    })
  })

  describe('Comment validation', () => {
    it('should fail when comment is empty (min length 1)', () => {
      const schema = getCorrectionSchema(true)
      const result = schema.safeParse({ comment: { detail: '' } })

      expect(result.success).toBe(false)
    })

    it('should accept a valid comment', () => {
      const schema = getCorrectionSchema(true)
      const result = schema.safeParse({ comment: { detail: 'Correcting director mailing address' } })

      expect(result.success).toBe(true)
      expect(result.data!.comment).toEqual({ detail: 'Correcting director mailing address' })
    })

    it('should reject a comment exceeding the configured max length', () => {
      const schema = getCorrectionSchema(true)
      const longComment = 'a'.repeat(CORRECTION_DETAIL_COMMENT_MAX_LENGTH + 1)
      const result = schema.safeParse({ comment: { detail: longComment } })

      expect(result.success).toBe(false)
    })

    it('should accept a comment at exactly the configured max length', () => {
      const schema = getCorrectionSchema(true)
      const maxComment = 'a'.repeat(CORRECTION_DETAIL_COMMENT_MAX_LENGTH)
      const result = schema.safeParse({ comment: { detail: maxComment } })

      expect(result.success).toBe(true)
    })
  })

  describe('Active edit state fields', () => {
    it('should default active fields to undefined', () => {
      const schema = getCorrectionSchema(true)
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.activeDirector).toBeUndefined()
      expect(result.data!.activeReceiver).toBeUndefined()
      expect(result.data!.activeLiquidator).toBeUndefined()
      expect(result.data!.activeOffice).toBeUndefined()
      expect(result.data!.activeClass).toBeUndefined()
      expect(result.data!.activeSeries).toBeUndefined()
    })
  })
})
