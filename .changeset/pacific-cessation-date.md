---
"@sbc-connect/nuxt-business-base": patch
---

Default a ceased director's cessation date to today in Pacific time instead of UTC (in FormPartyRole and formatRelationshipRolesApi), so it no longer fails the 'not in the future' check after 5pm PT.
