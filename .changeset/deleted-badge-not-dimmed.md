---
"@sbc-connect/nuxt-business-base": patch
---

Update deleted styling for all tables: the DELETED badge keeps its own style and is no longer greyed out with its deleted row in the offices and amalgamating businesses tables (only the name is greyed out), matching the other tables. The badge style is now one shared `DELETED_BADGE_CLASS`, used by the table badges and the court order file list.
