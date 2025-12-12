---
"@sbc-connect/nuxt-business-base": patch
---

### useBusinessParty
- add getPartiesMergedWithRelationships to support merging current party data with draft relationships data

### useFiling
- update initFiling to support filing sub type
- update initFiling to intialize fee information based on filing type and filing sub type
- update initFiling to check user business permissions
- add getCommonFilingPayloadData

### useManageParties
- update addNewParty to add a role item if roleType is given

### enums
- update ActionType (removed unused roles)
- update AuthorizedAction (add OFFICER_CHANGE_FILING)
- update FilingSubType (add reveiver sub types)
- add ReceiverType (contains receiver sub types)
- add RoleTypeUi enum

### useBusinessPermissionsStore
- add permission checks for changeOfOfficers/Receivers/Liquidators

### useBusinessStore
- add isAllowedFiling (moved util here and updated as needed)

### utils
- isFilingAllowed moved into business store
- several formating funtions added to support BusinessRelationship payloads 

