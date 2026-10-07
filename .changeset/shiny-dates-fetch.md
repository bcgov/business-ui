---
"@sbc-connect/nuxt-business-base": minor
---

Add as-of-date (`date` query) support to parties and addresses fetches: getAddresses/addressesOptions accept an optional query (mirroring getParties), getBusinessParties and getBusinessAddresses accept an optional date, and initFiling partiesParams accepts date. Needed for backdated change-of-directors and coop annual-report as-of-AGM-date reloads.
