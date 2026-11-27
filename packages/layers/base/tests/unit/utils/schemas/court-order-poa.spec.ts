import { describe, it, expect, beforeEach } from 'vitest'

describe('getCourtOrderPoaSchema', () => {
  let schema: ReturnType<typeof getCourtOrderPoaSchema>

  beforeEach(() => {
    schema = getCourtOrderPoaSchema()
  })

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
      expect(issues[0]!.message).toBe('Court order number is required.')
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

describe('getCourtOrderPoaFullSchema', () => {
  let schema: ReturnType<typeof getCourtOrderPoaFullSchema>

  beforeEach(() => {
    schema = getCourtOrderPoaFullSchema()
  })

  it('should not apply the standalone filing cross field rules without the context option', () => {
    // no court order number, no order details and no files
    const result = schema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should not apply the max one court order file rule without the context option', () => {
    const getFile = (id: string): CourtOrderFileUi => ({
      id,
      fileKey: `drs-key-${id}`,
      name: 'court_order.pdf',
      type: DocumentTypeClient.COURT_ORDER,
      action: CourtOrderFileAction.NONE,
      status: CourtOrderFileStatus.SUCCESS
    })

    const result = schema.safeParse({ files: [getFile('file-1'), getFile('file-2')] })
    expect(result.success).toBe(true)
  })
})

const orderDetails = 'some court order text'

describe('getCourtOrderPoaFullSchema with isFileAndDetailsRequired', () => {
  let schema: ReturnType<typeof getCourtOrderPoaFullSchema>

  beforeEach(() => {
    schema = getCourtOrderPoaFullSchema({ isFileAndDetailsRequired: true })
  })

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
    const result = schema.safeParse({ fileNumber: '12345', orderDetails, files: [getFile()] })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(expect.objectContaining({
      isEditing: false,
      actions: [],
      effectOfOrder: false,
      filingId: -1,
      files: [getFile()],
      fileNumber: '12345',
      orderDetails
    }))
    expect(typeof result.data!.id).toBe('string')
  })

  describe('fileNumber', () => {
    it('should fail when missing', () => {
      const result = schema.safeParse({ orderDetails, files: [getFile()] })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['fileNumber'],
          message: 'This field is required'
        })
      ])
    })

    it('should fail when too short', () => {
      const result = schema.safeParse({ fileNumber: '1234', files: [getFile()] })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Minimum 5 characters')
    })

    it('should fail when too long', () => {
      const result = schema.safeParse({ fileNumber: 'a'.repeat(21), files: [getFile()] })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Maximum 20 characters')
    })
  })

  describe('orderDetails', () => {
    it.each([
      ['missing', undefined],
      ['empty', ''],
      ['only whitespace', '   ']
    ])('should fail when %s', (_label, details) => {
      const result = schema.safeParse({ fileNumber: '12345', orderDetails: details, files: [getFile()] })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['orderDetails'],
          message: 'This field is required'
        })
      ])
    })
  })

  describe('court order file', () => {
    it('should fail when no court order file exists', () => {
      const result = schema.safeParse({ fileNumber: '12345', orderDetails })

      expect(result.success).toBe(false)
      expect(result.error!.issues).toEqual([
        expect.objectContaining({
          path: ['files'],
          message: 'Court order document is required.'
        })
      ])
    })

    it('should pass while the court order file is still uploading', () => {
      const result = schema.safeParse({
        fileNumber: '12345',
        orderDetails,
        files: [getFile({ status: CourtOrderFileStatus.LOADING })]
      })
      expect(result.success).toBe(true)
    })

    it.each([
      ['deleted', { action: CourtOrderFileAction.DELETED }],
      ['errored', { status: CourtOrderFileStatus.ERROR }],
      ['a supporting document', { type: DocumentTypeClient.SUPPORTING_DOCUMENT }]
    ])('should fail when the only file is %s', (_label, overrides) => {
      const result = schema.safeParse({ fileNumber: '12345', orderDetails, files: [getFile(overrides)] })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Court order document is required.')
    })
  })

  describe('max one court order file', () => {
    it('should fail when two active court order files exist', () => {
      const result = schema.safeParse({
        fileNumber: '12345',
        orderDetails,
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
        orderDetails,
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
        orderDetails,
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

describe('getCourtOrderPoaFullSchema hasSupportingDocs', () => {
  const getSupportingDoc = (overrides: Partial<CourtOrderFileUi> = {}): CourtOrderFileUi => ({
    id: 'supporting-1',
    fileKey: 'drs-key-supporting-1',
    name: 'affidavit.pdf',
    type: DocumentTypeClient.SUPPORTING_DOCUMENT,
    action: CourtOrderFileAction.NONE,
    status: CourtOrderFileStatus.SUCCESS,
    ...overrides
  })

  const expectedIssue = expect.objectContaining({
    path: ['hasSupportingDocs'],
    message: 'Add Supporting Documents or uncheck the box above'
  })

  // the flag hydrates everywhere, the checkbox rule only applies to the standalone filing (context)
  const contexts = [
    ['without the context option', undefined],
    ['with isFileAndDetailsRequired', { isFileAndDetailsRequired: true }]
  ] as const
  const filingContext = { isFileAndDetailsRequired: true }
  // the standalone filing also requires the court order document
  const courtOrderDoc = getSupportingDoc({ id: 'file-0', fileKey: 'drs-key-0', type: DocumentTypeClient.COURT_ORDER })

  it.each(contexts)('should default to false %s', (_label, context) => {
    const result = getCourtOrderPoaFullSchema(context).safeParse({
      fileNumber: '12345',
      orderDetails,
      files: [courtOrderDoc]
    })

    expect(result.success).toBe(true)
    expect(result.data!.hasSupportingDocs).toBe(false)
  })

  it.each(contexts)('should derive true from an active supporting document %s', (_label, context) => {
    const result = getCourtOrderPoaFullSchema(context).safeParse({
      fileNumber: '12345',
      orderDetails,
      files: [courtOrderDoc, getSupportingDoc()]
    })

    expect(result.success).toBe(true)
    expect(result.data!.hasSupportingDocs).toBe(true)
  })

  it('should fail when checked with no supporting document with isFileAndDetailsRequired', () => {
    const result = getCourtOrderPoaFullSchema(filingContext).safeParse({
      fileNumber: '12345',
      orderDetails,
      files: [courtOrderDoc],
      hasSupportingDocs: true
    })

    expect(result.success).toBe(false)
    expect(result.error!.issues).toEqual([expectedIssue])
  })

  it('should not apply the checkbox rule without the context option (sub form)', () => {
    const result = getCourtOrderPoaFullSchema().safeParse({
      fileNumber: '12345',
      orderDetails,
      hasSupportingDocs: true
    })

    expect(result.success).toBe(true)
  })

  it.each([
    ['deleted', { action: CourtOrderFileAction.DELETED }],
    ['errored', { status: CourtOrderFileStatus.ERROR }]
  ])('should fail when checked and the only supporting document is %s', (_label, overrides) => {
    const result = getCourtOrderPoaFullSchema(filingContext).safeParse({
      fileNumber: '12345',
      orderDetails,
      hasSupportingDocs: true,
      files: [courtOrderDoc, getSupportingDoc(overrides)]
    })

    expect(result.success).toBe(false)
    expect(result.error!.issues).toEqual([expectedIssue])
  })

  it('should pass when checked with an active supporting document', () => {
    const result = getCourtOrderPoaFullSchema(filingContext).safeParse({
      fileNumber: '12345',
      orderDetails,
      hasSupportingDocs: true,
      files: [courtOrderDoc, getSupportingDoc()]
    })

    expect(result.success).toBe(true)
  })

  it('should not count a court order file as a supporting document', () => {
    const result = getCourtOrderPoaFullSchema(filingContext).safeParse({
      fileNumber: '12345',
      orderDetails,
      hasSupportingDocs: true,
      files: [getSupportingDoc({ type: DocumentTypeClient.COURT_ORDER })]
    })

    expect(result.success).toBe(false)
    expect(result.error!.issues).toEqual([expectedIssue])
  })
})
