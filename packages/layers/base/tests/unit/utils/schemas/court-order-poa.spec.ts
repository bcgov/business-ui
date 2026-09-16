import { describe, it, expect } from 'vitest'

describe('getCourtOrderPoaSchema', () => {
  const schema = getCourtOrderPoaSchema()

  describe('courtOrderNumber', () => {
    it('should pass when undefined', () => {
      const result = schema.safeParse({ courtOrderNumber: undefined })
      expect(result.success).toBe(true)
    })

    it('should pass when empty string', () => {
      const result = schema.safeParse({ courtOrderNumber: '' })
      expect(result.success).toBe(true)
    })

    it('should pass when equal to min length', () => {
      const result = schema.safeParse({ courtOrderNumber: '12345' })
      expect(result.success).toBe(true)
    })

    it('should pass when equal to max length', () => {
      const result = schema.safeParse({ courtOrderNumber: 'a'.repeat(20) })
      expect(result.success).toBe(true)
    })

    it('should fail validation and return correct message when too short', () => {
      const result = schema.safeParse({ courtOrderNumber: '1234' })

      expect(result.success).toBe(false)

      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Minimum 5 characters')
    })

    it('should fail validation and return correct message when too long', () => {
      const result = schema.safeParse({ courtOrderNumber: 'a'.repeat(21) })

      expect(result.success).toBe(false)

      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Maximum 20 characters')
    })
  })

  describe('hasPoa', () => {
    it('should pass when undefined', () => {
      const result = schema.safeParse({ hasPoa: undefined })
      expect(result.success).toBe(true)
    })

    it('should fail when true (requires courtOrderNumber)', () => {
      const result = schema.safeParse({ hasPoa: true })
      expect(result.success).toBe(false)
    })

    it('should pass when false', () => {
      const result = schema.safeParse({ hasPoa: false })
      expect(result.success).toBe(true)
    })
  })

  describe('superRefine', () => {
    it('should pass when hasPoa is false and courtOrderNumber is empty', () => {
      const result = schema.safeParse({ hasPoa: false, courtOrderNumber: '' })
      expect(result.success).toBe(true)
    })

    it('should pass when hasPoa is undefined and courtOrderNumber is undefined', () => {
      const result = schema.safeParse({ hasPoa: undefined, courtOrderNumber: undefined })
      expect(result.success).toBe(true)
    })

    it('should fail when hasPoa is true and missing courtOrderNumber', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: '' })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('This field is required')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should fail when hasPoa is true and courtOrderNumber is too short', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: '1234' })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Minimum 5 characters')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should fail when hasPoa is true and courtOrderNumber is too long', () => {
      const result = schema.safeParse({ hasPoa: true, courtOrderNumber: 'a'.repeat(21) })
      const issues = result.error!.issues
      expect(issues).toHaveLength(1)
      expect(issues[0]!.message).toBe('Maximum 20 characters')
      expect(issues[0]!.path).toEqual(['courtOrderNumber'])
      expect(result.success).toBe(false)
    })

    it('should pass when hasPoa is true and courtOrderNumber is between 5 and 20 characters', () => {
      const result1 = schema.safeParse({ hasPoa: true, courtOrderNumber: '12345' })
      const result2 = schema.safeParse({ hasPoa: true, courtOrderNumber: 'a'.repeat(20) })
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})

describe('getCourtOrderFilingSchema', () => {
  const schema = getCourtOrderFilingSchema()

  const getFile = (overrides: Partial<CourtOrderFileUi> = {}): CourtOrderFileUi => ({
    id: 'file-1',
    fileKey: 'drs-key-1',
    name: 'court_order.pdf',
    type: DocumentTypeClient.COURT_ORDER,
    action: CourtOrderFileAction.NONE,
    status: CourtOrderFileStatus.SUCCESS,
    ...overrides
  })

  const getMessages = (result: ReturnType<typeof schema.safeParse>) =>
    (result.error?.issues ?? []).map(issue => issue.message)

  it('should apply the full schema defaults', () => {
    const result = schema.safeParse({ fileNumber: '12345', orderDetails: 'some court order text' })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(expect.objectContaining({
      isEditing: false,
      actions: [],
      effectOfOrder: false,
      filingId: -1,
      files: [],
      fileNumber: '12345',
      orderDetails: 'some court order text'
    }))
    expect(typeof result.data!.id).toBe('string')
  })

  describe('fileNumber', () => {
    it('should fail when missing', () => {
      const result = schema.safeParse({ orderDetails: 'some court order text' })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['fileNumber'],
          message: 'This field is required'
        })
      ])
    })

    it('should fail when too short', () => {
      const result = schema.safeParse({ fileNumber: '1234', orderDetails: 'some court order text' })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Minimum 5 characters')
    })

    it('should fail when too long', () => {
      const result = schema.safeParse({ fileNumber: 'a'.repeat(21), orderDetails: 'some court order text' })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Maximum 20 characters')
    })
  })

  describe('order details or court order file', () => {
    it('should fail when neither order details nor a court order file exist', () => {
      const result = schema.safeParse({ fileNumber: '12345' })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['orderDetails'],
          message: 'Enter a court order or upload a file'
        })
      ])
    })

    it('should fail when order details are only whitespace', () => {
      const result = schema.safeParse({ fileNumber: '12345', orderDetails: '   ' })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Enter a court order or upload a file')
    })

    it('should pass with order details and no files', () => {
      const result = schema.safeParse({ fileNumber: '12345', orderDetails: 'some court order text' })
      expect(result.success).toBe(true)
    })

    it('should pass with a court order file and no order details', () => {
      const result = schema.safeParse({ fileNumber: '12345', files: [getFile()] })
      expect(result.success).toBe(true)
    })

    it.each([
      ['deleted', { action: CourtOrderFileAction.DELETED }],
      ['errored', { status: CourtOrderFileStatus.ERROR }],
      ['a supporting document', { type: DocumentTypeClient.SUPPORTING_DOCUMENT }]
    ])('should fail when the only file is %s', (_label, overrides) => {
      const result = schema.safeParse({ fileNumber: '12345', files: [getFile(overrides)] })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Enter a court order or upload a file')
    })
  })

  describe('max one court order file', () => {
    it('should fail when two active court order files exist', () => {
      const result = schema.safeParse({
        fileNumber: '12345',
        files: [getFile(), getFile({ id: 'file-2', fileKey: 'drs-key-2' })]
      })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['files'],
          message: 'Only one court order per filing.'
        })
      ])
    })

    it('should pass when the second court order file is deleted', () => {
      const result = schema.safeParse({
        fileNumber: '12345',
        files: [
          getFile(),
          getFile({ id: 'file-2', fileKey: 'drs-key-2', action: CourtOrderFileAction.DELETED })
        ]
      })

      expect(result.success).toBe(true)
    })

    it('should pass with one court order file and many supporting documents', () => {
      const result = schema.safeParse({
        fileNumber: '12345',
        files: [
          getFile(),
          getFile({ id: 'file-2', fileKey: 'drs-key-2', type: DocumentTypeClient.SUPPORTING_DOCUMENT }),
          getFile({ id: 'file-3', fileKey: 'drs-key-3', type: DocumentTypeClient.SUPPORTING_DOCUMENT })
        ]
      })

      expect(result.success).toBe(true)
    })
  })
})
