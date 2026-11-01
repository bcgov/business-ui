---
"@sbc-connect/nuxt-business-base": minor
---

Add filing section validation support to business services and ManageYourCompany component

- Add `validateFilingSection` endpoint service and query options for partial filing validations
- Update `ManageYourCompany` to accept `filingType` and `filingSubType` props
- Pass filing context to `getActiveYourCompanySchema` to enable asynchronous legal name designation validation