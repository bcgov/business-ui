---
"@sbc-connect/nuxt-business-base": minor
---

Change-of-address foundations: buildChangeOfAddressOffices (ManageOffices table state → offices payload keyed by office type) and a bcCanadaOnly option on the address schemas, threaded through FormAddress/FormOfficeDetails/ManageOffices — country/region inputs stay editable and out-of-BC/Canada values surface inline validation errors (matching legal-api's changeOfAddress rules).
