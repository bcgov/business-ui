---
"@sbc-connect/nuxt-business-base": minor
---

### Composables
- **New** - useBusinessStateReason: historical state reason text (amalgamation, dissolution, continuation out, put back off) with tombstone integration

### Services
- getFiling / filing query / keys.filing: added `publicData` flag (fetches `?public=true` view of a filing; query key now ends with `{ publicData }`)

### Interfaces
- BusinessDataPublic: added amalgamatedInto and stateFiling fields
- **New** - FilingGetByIdPublicResponse, PublicStateFilingBody, BusinessAmalgamatedInto
