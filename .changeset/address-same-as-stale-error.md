---
"@sbc-connect/nuxt-business-base": patch
---

`FormAddress`: with "same as" checked and both addresses required in BC (e.g. the liquidation records office), moving the mailing province out of BC and back no longer unchecks "same as" and leaves a stale "Address must be in British Columbia" error on the delivery address. Re-checking the filled fields now replaces their previous errors instead of only adding new ones.
