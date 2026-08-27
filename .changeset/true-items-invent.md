---
"@sbc-connect/nuxt-business-base": minor
---

**PartyDetails**: Added an Email Address section, shown and required automatically for parties holding a role configured in `ROLE_ADDITIONAL_FIELDS` (currently Director), mirroring the existing effective-date-by-role pattern.

- Added `FormPartyEmail` component and `getPartyEmailSchema` (required/max-254-chars/valid-format validation, in that priority order).
- Added `PartySchema.email` and wired it through `formatPartyUi`/`formatRelationshipUi`/`formatRelationshipApi`.
- Added `ManageAllowedAction.EMAIL_CHANGE`.
- Consolidated the per-role additional-field config (`ROLES_REQUIRING_EFFECTIVE_DATE`) and the new email rules into a single `ROLE_ADDITIONAL_FIELDS` map with independent `showEmail`/`requireEmail`/`effectiveDate` flags per role.
