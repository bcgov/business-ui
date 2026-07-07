export interface BusinessComment {
  businessId?: string
  comment: string
  commentType?: CommentType
  filingId?: string
  submitterDisplayName: string
  timestamp: string
}
