import { describe, it, expect } from 'vitest'

/**
 * Unit tests for the standalone court order filing form schema.
 *
 * `getCourtOrderFormSchema` composes the base layer's `getCourtOrderPoaFullFilingSchema` (court order
 * number + 'order details OR one court order file' cross field rules) with the shared staff
 * payment schema. The base layer rules are covered in depth by the base layer spec - these tests
 * assert the composition (defaults, nested paths, staff payment) the corps page relies on.
 */
describe('getCourtOrderFormSchema', () => {
  const schema = getCourtOrderFormSchema()

  const getFile = (overrides: Partial<CourtOrderFileUi> = {}): CourtOrderFileUi => ({
    id: 'file-1',
    fileKey: 'CORP-DS0100001003',
    name: 'court_order.pdf',
    type: DocumentTypeClient.COURT_ORDER,
    action: CourtOrderFileAction.NONE,
    status: CourtOrderFileStatus.SUCCESS,
    ...overrides
  })

  const getIssues = (result: ReturnType<typeof schema.safeParse>) => result.error?.issues ?? []

  const getMessages = (result: ReturnType<typeof schema.safeParse>) =>
    getIssues(result).map(issue => issue.message)

  const validStaffPayment = {
    option: StaffPaymentOption.FAS,
    bcolAccountNumber: '',
    datNumber: '',
    routingSlipNumber: '123456789',
    folioNumber: '',
    isPriority: false
  }

  describe('defaults', () => {
    it('should use correct default values', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.courtOrder).toEqual(expect.objectContaining({
        isEditing: false,
        actions: [],
        fileNumber: '',
        effectOfOrder: false,
        orderDetails: null,
        files: [],
        filingId: -1,
        filingType: FilingType.COURT_ORDER
      }))
      expect(typeof result.data!.courtOrder.id).toBe('string')
    })

    it('should default the staff payment to NONE', () => {
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
      expect(result.data!.staffPayment).toEqual({
        option: StaffPaymentOption.NONE,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '',
        folioNumber: '',
        isPriority: false
      })
    })

    it('should not validate the court order cross field rules when the default is used', () => {
      // the page always hydrates courtOrder from the pre-created draft, so defaults must parse
      const result = schema.safeParse({})

      expect(result.success).toBe(true)
    })
  })

  describe('courtOrder.fileNumber', () => {
    it('should fail when empty', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '', orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(false)
      // NB: an explicitly empty file number trips both the min length and the 'required' refine
      expect(getIssues(result)).toContainEqual(
        expect.objectContaining({
          path: ['courtOrder', 'fileNumber'],
          message: 'This field is required'
        })
      )
    })

    it('should fail when omitted (schema default)', () => {
      const result = schema.safeParse({
        courtOrder: { orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result)).toEqual([
        expect.objectContaining({
          path: ['courtOrder', 'fileNumber'],
          message: 'This field is required'
        })
      ])
    })

    it('should fail when fewer than 5 characters', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '1234', orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Minimum 5 characters')
    })

    it('should fail when more than 20 characters', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: 'a'.repeat(21), orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Maximum 20 characters')
    })

    it.each([5, 12, 20])('should pass with a %i character file number', (length) => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: 'a'.repeat(length), orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(true)
    })
  })

  describe('courtOrder order details or court order file', () => {
    it('should fail when there are no order details and no active court order file', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789' }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result)).toEqual([
        expect.objectContaining({
          path: ['courtOrder', 'orderDetails'],
          message: 'Enter a court order or upload a file'
        })
      ])
    })

    it('should fail when the order details are only whitespace', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: '   ' }
      })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Enter a court order or upload a file')
    })

    it('should pass with order details and no files', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: 'some court order text' }
      })

      expect(result.success).toBe(true)
      expect(result.data!.courtOrder.orderDetails).toBe('some court order text')
      expect(result.data!.courtOrder.files).toEqual([])
    })

    it('should pass with an active court order file and no order details', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', files: [getFile()] }
      })

      expect(result.success).toBe(true)
      expect(result.data!.courtOrder.orderDetails).toBeNull()
      expect(result.data!.courtOrder.files).toHaveLength(1)
    })

    it.each([
      ['deleted', { action: CourtOrderFileAction.DELETED }],
      ['errored', { status: CourtOrderFileStatus.ERROR }],
      ['a supporting document', { type: DocumentTypeClient.SUPPORTING_DOCUMENT }]
    ])('should fail when the only file is %s', (_label, overrides) => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', files: [getFile(overrides)] }
      })

      expect(result.success).toBe(false)
      expect(getMessages(result)).toContain('Enter a court order or upload a file')
    })
  })

  describe('courtOrder max one court order file', () => {
    it('should fail when two active court order files exist', () => {
      const result = schema.safeParse({
        courtOrder: {
          fileNumber: '12345-6789',
          orderDetails: 'some court order text',
          files: [getFile(), getFile({ id: 'file-2', fileKey: 'CORP-DS0100001004' })]
        }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result)).toEqual([
        expect.objectContaining({
          path: ['courtOrder', 'files'],
          message: 'Only one court order per filing.'
        })
      ])
    })

    it.each([
      ['deleted', { action: CourtOrderFileAction.DELETED }],
      ['errored', { status: CourtOrderFileStatus.ERROR }]
    ])('should pass when the second court order file is %s', (_label, overrides) => {
      const result = schema.safeParse({
        courtOrder: {
          fileNumber: '12345-6789',
          orderDetails: 'some court order text',
          files: [getFile(), getFile({ id: 'file-2', fileKey: 'CORP-DS0100001004', ...overrides })]
        }
      })

      expect(result.success).toBe(true)
    })

    it('should pass with one court order file and many supporting documents', () => {
      const result = schema.safeParse({
        courtOrder: {
          fileNumber: '12345-6789',
          files: [
            getFile(),
            getFile({ id: 'file-2', fileKey: 'CORP-DS0100001004', type: DocumentTypeClient.SUPPORTING_DOCUMENT }),
            getFile({ id: 'file-3', fileKey: 'CORP-DS0100001005', type: DocumentTypeClient.SUPPORTING_DOCUMENT })
          ]
        }
      })

      expect(result.success).toBe(true)
      expect(result.data!.courtOrder.files).toHaveLength(3)
    })
  })

  describe('staffPayment', () => {
    it('should pass with a valid staff payment selection', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: 'some court order text' },
        staffPayment: validStaffPayment
      })

      expect(result.success).toBe(true)
      expect(result.data!.staffPayment).toEqual(validStaffPayment)
    })

    it.each([
      StaffPaymentOption.NO_FEE,
      StaffPaymentOption.FAS,
      StaffPaymentOption.BCOL
    ])('should accept the %s payment option when its required fields are given', (option) => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: 'some court order text' },
        staffPayment: {
          ...validStaffPayment,
          option,
          bcolAccountNumber: option === StaffPaymentOption.BCOL ? '123456' : '',
          datNumber: option === StaffPaymentOption.BCOL ? 'C1234567' : '',
          routingSlipNumber: option === StaffPaymentOption.FAS ? '123456789' : ''
        }
      })

      expect(result.success).toBe(true)
      expect(result.data!.staffPayment.option).toBe(option)
    })

    it('should fail when an explicit staff payment option is not selected', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: 'some court order text' },
        staffPayment: { ...validStaffPayment, option: StaffPaymentOption.NONE, routingSlipNumber: '' }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result)).toEqual([
        expect.objectContaining({ path: ['staffPayment', 'option'] })
      ])
    })

    it('should fail when the FAS routing slip number is missing', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '12345-6789', orderDetails: 'some court order text' },
        staffPayment: { ...validStaffPayment, routingSlipNumber: '' }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result)).toEqual([
        expect.objectContaining({ path: ['staffPayment', 'routingSlipNumber'] })
      ])
    })

    it('should report court order and staff payment issues together', () => {
      const result = schema.safeParse({
        courtOrder: { fileNumber: '1234' },
        staffPayment: { ...validStaffPayment, routingSlipNumber: '' }
      })

      expect(result.success).toBe(false)
      expect(getIssues(result).map(issue => issue.path)).toEqual(expect.arrayContaining([
        ['courtOrder', 'fileNumber'],
        ['courtOrder', 'orderDetails'],
        ['staffPayment', 'routingSlipNumber']
      ]))
    })
  })
})
