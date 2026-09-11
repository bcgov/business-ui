---
"@sbc-connect/nuxt-business-base": minor
---

Add an `email` column for the party table and track email changes for corrections.

- Added `getEmailColumn` and wired it into `getPartyTableColumns` as the `email` column, used by custodian-of-records sections.
- Added `'email'` to `TablePartyColumnName`.
- `useManageParties` now compares party `email` against its original value and emits `ActionType.EMAIL_CHANGED` when it differs, alongside the existing `address`/`name`/`roles` sections.
