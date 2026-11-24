---
"@sbc-connect/nuxt-business-base": minor
---

`getToday()` now defaults to pacific time (`America/Vancouver`) instead of UTC, so dates set from "today" match the business's local date. Callers that pass no timezone (filing header `date`, role cessation dates) now get the pacific date; pass `'UTC'` explicitly to keep the old behaviour.
