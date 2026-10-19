---
"@sbc-connect/nuxt-business-base": minor
---

Refactor ManageShareStructure models and composable actions
- Replaced separate class, series and date model with a single activeSubject model ref.
- Simplify useManageShareStructure add, undo, remove, edit methods to handle multiple schema types using type predicates.
- Update useManageCommon to accept multiple alert target IDs for a single model ref.
- Moved share structure component and composable to be under the `/manage` directory.
