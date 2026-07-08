import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { CommentType } from '#imports'

const mockBusinessService = {
  getFilingComments: vi.fn(),
  getFilingDocumentUrls: vi.fn()
}
mockNuxtImport('useBusinessService', () => () => mockBusinessService)

/** Builds a comment of the given type. */
const buildComment = (commentType: CommentType | undefined, comment = 'text') => ({
  comment,
  commentType,
  submitterDisplayName: 'BC Registries Staff',
  timestamp: '2025-10-14T14:11:20.310185+00:00'
})

/** Builds a minimal ledger item; each test uses a unique filingId to keep them separate. */
const buildFiling = (filingId: number, comments: Array<ReturnType<typeof buildComment>>) =>
  ({ filingId, comments } as unknown as BusinessLedgerItem)

describe('useBusinessLedger - filing detail comments', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('splits FILING comments out of the detail comments', () => {
    const filing = buildFiling(1001, [
      buildComment(CommentType.STAFF, 'staff note'),
      buildComment(CommentType.FILING, 'filing detail'),
      buildComment(CommentType.STAFF, 'another staff note')
    ])

    const { filingDetailComments, detailComments } = useBusinessLedger(filing)

    expect(filingDetailComments.value.map(c => c.comment)).toEqual(['filing detail'])
    expect(detailComments.value.map(c => c.comment)).toEqual(['staff note', 'another staff note'])
  })

  test('returns every FILING comment (eg, a correction records two)', () => {
    const filing = buildFiling(1002, [
      buildComment(CommentType.FILING, 'This filing was corrected on 2025-10-14.'),
      buildComment(CommentType.FILING, 'Reason for the correction.')
    ])

    const { filingDetailComments, detailComments } = useBusinessLedger(filing)

    expect(filingDetailComments.value).toHaveLength(2)
    expect(detailComments.value).toHaveLength(0)
  })

  test('treats comments with no commentType as detail comments', () => {
    const filing = buildFiling(1003, [buildComment(undefined, 'legacy comment')])

    const { filingDetailComments, detailComments } = useBusinessLedger(filing)

    expect(filingDetailComments.value).toHaveLength(0)
    expect(detailComments.value.map(c => c.comment)).toEqual(['legacy comment'])
  })
})
