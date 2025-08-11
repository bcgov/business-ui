/** Order of the statuses here is important for the filter. Please don't change the order or alphabetize. */
export const STATUS_FILTER_OPTIONS = [
  EntityStateStatus.ACTIVE,
  NrDisplayStates.DRAFT,
  EntityStateStatus.HISTORICAL,
  NrDisplayStates.APPROVED,
  EntityStateStatus.AWAITING_REVIEW,
  NrDisplayStates.CONDITIONAL,
  NrDisplayStates.EXPIRED,
  NrDisplayStates.CONSUMED,
  EntityStateStatus.WITHDRAWN,
  EntityStateStatus.CHANGE_REQUESTED,
  NrDisplayStates.REJECTED,
  EntityStateStatus.PAID,
  NrDisplayStates.PROCESSING,
  NrDisplayStates.CANCELLED,
  NrDisplayStates.REFUND_REQUESTED
]

/**
 * Mirrors STATUS_FILTER_OPTIONS but marks where a section break should appear in the UI.
 *
 * Guidelines:
 * - Keep the same order and items as STATUS_FILTER_OPTIONS (do not reorder or alphabetize).
 * - Comment out items that are NOT break points — this preserves the visual mapping to STATUS_FILTER_OPTIONS.
 * - Uncomment items that should start a new group in the filter UI.
 */
export const STATUS_FILTER_OPTIONS_SECTION_BREAK_BEFORE = [
  // EntityStateStatus.ACTIVE,
  // NrDisplayStates.DRAFT,
  // EntityStateStatus.HISTORICAL,
  NrDisplayStates.APPROVED,
  // EntityStateStatus.AWAITING_REVIEW,
  // NrDisplayStates.CONDITIONAL,
  // NrDisplayStates.EXPIRED,
  // NrDisplayStates.CONSUMED,
  EntityStateStatus.WITHDRAWN,
  // EntityStateStatus.CHANGE_REQUESTED,
  // NrDisplayStates.REJECTED,
  EntityStateStatus.PAID
  // NrDisplayStates.PROCESSING,
  // NrDisplayStates.CANCELLED,
  // NrDisplayStates.REFUND_REQUESTED
]
