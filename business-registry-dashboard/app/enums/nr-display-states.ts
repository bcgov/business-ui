/* eslint-disable */
export enum NrDisplayStates {
  APPROVED = 'Approved',
  HOLD = 'Pending Staff Review',
  DRAFT = 'Draft',
  REJECTED = 'Rejected',
  CONDITIONAL = 'Conditional Approval',
  CONDITION = 'Conditional Approval', // TODO: find out what value this should actually be
  REFUND_REQUESTED = 'Cancelled, Refund Requested',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
  CONSUMED = 'Consumed',
  PROCESSING = 'Processing'
}
