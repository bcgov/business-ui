---
"@sbc-connect/nuxt-business-base": minor
---

UX feedback updates for the correction filing flow

- Added cross-section `preventActions` + `actionPreventedSignal` props to `ManageParties`, `ManageOffices`, `ManageShareStructure`, `ManageNameTranslations`, and `ManageCompanyName` so that opening a sub-form in any one section blocks edits in all other sections
- Each manage component now emits `action-prevented` and propagates it up to the correction step, which increments a shared signal to trigger the correct inline alert in the active section
- Fixed `setActiveFormAlert` in all manage components to only fire when the component's own sub-form is open, preventing false alerts on sibling sections
- Wrapped the company name display and edit area in a `pointerdown`/`keydown` listener that clears stale button-control and filing alerts before a new interaction
- Passed `variant` and `subject` props through to `FormBusinessName` inside `ManageCompanyName`, and aligned the dropdown menu to `end` to fix overflow clipping
- Refactored `FormBusinessName` template to use `SubFormWrapper` (replacing the manual Cancel/Done button row), making the form header and action buttons consistent with other sub-forms
- Increased sub-form header font size to `text-lg` and reduced the task-guard alert text to `text-sm` in `SubFormWrapper` for better visual hierarchy
- Fixed the table row separator in `TableBusiness` to hide on expanded rows (`data-[expanded=true]:after:hidden`), removing the double-border when a sub-form is open
- Adjusted name translation table column padding (`pl-0 pr-2` for name, `pl-2 pr-0` for actions) to tighten the layout
- Bumped `@sbc-connect/nuxt-pay` to `0.4.0` (pulls in `nuxt-auth@0.11.1`, `nuxt-base@0.10.0`, `nuxt-forms@0.7.5`)
