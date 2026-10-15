---
"@sbc-connect/nuxt-business-base": minor
---

Filing payload helpers follow the `format<X>Api` convention: `formatFilingPayloadApi` (useFiling), and the standalone `formatPaymentHeaderApi`, `formatCommonFilingDataApi`, `applyAuthorizationCertify` (moved out of useFiling), `formatChangeOfAddressOfficesApi` and `formatChangeOfDirectorsRelationshipsApi`.

useFilingPage swaps its `h1` override for `i18nParams` (named params for the desc/h1/title keys) and a new `logBlockedSubmission` util logs the payload of a blocked Phase 1 submission.

`describeCommonFilingStoreBehaviour` takes a `supportsDrafts` option (default true) - set it false for a file and pay only filing store to skip every draft save/resume/hydration case.
