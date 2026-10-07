---
"@sbc-connect/nuxt-business-base": minor
---

Director-change kit for the change-of-directors migrations: getDirectorChangeManagePartiesProps preset (DIRECTOR role, no effective-date edits on existing directors), buildChangeOfDirectorsRelationships (changed-rows-only relationships payload with cessation-date override), syncDirectorChangeFee (paid/free BCCDR-BCFDR style fee swap with lazy fee init), getDirectorWarning (min-count/BC-residency/Canadian-residency soft warnings), and a legal-name-change confirmation checkbox in the party sub-form (opt-in via partyNameProps.requireNameChangeConfirmation). FormPartyDetails now scopes the allow-any-edits escape to added parties (variant add/edit) instead of keying off ADD in allowedActions.
