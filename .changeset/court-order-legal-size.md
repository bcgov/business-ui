---
"@sbc-connect/nuxt-business-base": patch
---

`FormCourtOrderPoaFullFileUpload`: accept court order and supporting document PDFs of any page size (legal size court documents were rejected); encrypted and corrupt files are still rejected. Removes `validation.invalidPageSizeLetterNamed`.
