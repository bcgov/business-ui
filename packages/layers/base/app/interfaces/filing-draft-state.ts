/**
 * A saved draft filing as held in a filing store.
 */
export type FilingDraftState<F, HeaderExtras = Record<never, never>> = FilingGetByIdResponse<F> & {
  filing: { header: Partial<FilingHeaderSubmission & HeaderExtras> }
}
