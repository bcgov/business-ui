/* eslint-disable max-len */
import { describe, it, expect } from 'vitest'
import { DateTime } from 'luxon'

describe('getResolutionDateSchema', () => {
  describe('Defaults', () => {
    it('should generate default fields correctly when passed an empty object', () => {
      const schema = getResolutionDateSchema()
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBeDefined()
        expect(typeof result.data.id).toBe('string')
        expect(result.data.date).toBe('')
        expect(result.data.isEditing).toBe(false)
        expect(result.data.actions).toEqual([])
      }
    })

    it('should preprocess a numeric id into a string', () => {
      const schema = getResolutionDateSchema()
      const result = schema.safeParse({ id: 123 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('123')
      }
    })
  })

  describe('superRefine', () => {
    describe('hasRightsOrRestrictions context', () => {
      it('should fail when date is empty and hasRightsOrRestrictions is true', () => {
        const schema = getResolutionDateSchema({ hasRightsOrRestrictions: true })
        const result = schema.safeParse({ date: '' })

        expect(result.success).toBe(false)
        const issues = result.error!.issues
        expect(issues).toHaveLength(1)
        expect(issues[0]!.path).toEqual(['date'])
        expect(issues[0]!.message).toBe('Required when changing a share structure with a class or series of shares with special rights or restrictions.')
      })

      it('should pass when date is provided and hasRightsOrRestrictions is true', () => {
        const schema = getResolutionDateSchema({ hasRightsOrRestrictions: true })
        const result = schema.safeParse({ date: '2026-01-01' })
        expect(result.success).toBe(true)
      })
    })

    describe('isEditingExisting context', () => {
      it('should fail when date is empty and isEditingExisting is true', () => {
        const schema = getResolutionDateSchema({ isEditingExisting: true })
        const result = schema.safeParse({ date: '   ' })

        expect(result.success).toBe(false)
        const issues = result.error!.issues
        expect(issues).toHaveLength(1)
        expect(issues[0]!.path).toEqual(['date'])
        expect(issues[0]!.message).toBe('This field is required')
      })
    })

    describe('dateRegex check', () => {
      it('should fail when date string format is incorrect', () => {
        const schema = getResolutionDateSchema()
        const result = schema.safeParse({ date: '01-01-2026' })

        expect(result.success).toBe(false)
        const issues = result.error!.issues
        expect(issues).toHaveLength(1)
        expect(issues[0]!.path).toEqual(['date'])
        expect(issues[0]!.message).toBe('Date must be a valid date in YYYY-MM-DD format')
      })
    })

    describe('existingResolutions context', () => {
      const existingResolutions = [
        { id: '1', date: '2026-01-01' },
        { id: '2', date: '2026-02-02' }
      ]

      it('should fail if date duplicates an existing resolution with a different ID', () => {
        const schema = getResolutionDateSchema({ existingResolutions })
        const result = schema.safeParse({ id: '3', date: '2026-01-01' })

        expect(result.success).toBe(false)
        const issues = result.error!.issues
        expect(issues).toHaveLength(1)
        expect(issues[0]!.path).toEqual(['date'])
        expect(issues[0]!.message).toBe('This date has already been added. You cannot enter it again.')
      })

      it('should pass if date matches an existing resolution but shares the same ID (editing mode)', () => {
        const schema = getResolutionDateSchema({ existingResolutions })
        const result = schema.safeParse({ id: '1', date: '2026-01-01' })
        expect(result.success).toBe(true)
      })
    })

    describe('Future Dates', () => {
      it('should fail when date is in the future', () => {
        const schema = getResolutionDateSchema()
        const tomorrowStr = DateTime.now().setZone('America/Vancouver').plus({ days: 1 }).toISODate()

        const result = schema.safeParse({ id: '2', date: tomorrowStr })

        expect(result.success).toBe(false)
        const issues = result.error!.issues
        expect(issues).toHaveLength(1)
        expect(issues[0]!.path).toEqual(['date'])
        expect(issues[0]!.message).toBe('Date cannot be a future date.')
      })

      it('should pass when date is today or in the past', () => {
        const schema = getResolutionDateSchema()
        const todayStr = DateTime.now().setZone('America/Vancouver').toISODate()

        const resultToday = schema.safeParse({ id: '2', date: todayStr })
        const resultPast = schema.safeParse({ id: '3', date: '2025-12-25' })

        expect(resultToday.success).toBe(true)
        expect(resultPast.success).toBe(true)
      })
    })
  })
})
