---
"@sbc-connect/nuxt-business-base": minor
---

New FormConfirmCompletingParty section form + getConfirmCompletingPartySchema for the consent/continuation-out filings: confirmation checkbox with the five statutory foreign-jurisdiction bullets and an interpolated completing-party name (defaults to the signed-in user; staff variant renders a required legal-name input via the editableName prop; lead-in sentence overridable via leadInTranslationPath). Consumers map the output to header.certifiedBy + authorizationReceived.
