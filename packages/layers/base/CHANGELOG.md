# @sbc-connect/nuxt-business-base

## 0.6.1

### Patch Changes

- [#349](https://github.com/bcgov/business-ui/pull/349) [`a855b08`](https://github.com/bcgov/business-ui/commit/a855b082aa02f8bc1563ec608cd6fb83e62a6a87) Thanks [@deetz99](https://github.com/deetz99)! - Fix business permissions store to evaluate changeOfLiquidators correctly.

## 0.6.0

### Minor Changes

- [#346](https://github.com/bcgov/business-ui/pull/346) [`31057c9`](https://github.com/bcgov/business-ui/commit/31057c9d59e1120870de261cc0b92e87f115dd62) Thanks [@deetz99](https://github.com/deetz99)! - Add allowedActions prop to FormPartyDetails, TableBusiness, TableParty and TableColumnActions components to restrict allowed actions on a given table row.

### Patch Changes

- [#348](https://github.com/bcgov/business-ui/pull/348) [`e4e16d4`](https://github.com/bcgov/business-ui/commit/e4e16d43c665b1afb745811a7576761e43d409c7) Thanks [@deetz99](https://github.com/deetz99)! - Allow edits in FormPartyDetails component when it's a newly added party, add LiquidateType enum.

## 0.5.0

### Minor Changes

- [#341](https://github.com/bcgov/business-ui/pull/341) [`de467bd`](https://github.com/bcgov/business-ui/commit/de467bdfb6c612e3f801b473c60f405263727395) Thanks [@deetz99](https://github.com/deetz99)! - <br>

  - useFilingPageWatcher - initializes filing pages business, fees, etc
  - dissolution enums for filing subtypes and allowed filings
  - mockCommonApiCallsForFiling test util

### Patch Changes

- [#332](https://github.com/bcgov/business-ui/pull/332) [`439e937`](https://github.com/bcgov/business-ui/commit/439e9370dd2adbb0fb40974cb0d038f7bdce8743) Thanks [@kialj876](https://github.com/kialj876)! - ### useBusinessParty

  - add getPartiesMergedWithRelationships to support merging current party data with draft relationships data

  ### useFiling

  - update initFiling to support filing sub type
  - update initFiling to intialize fee information based on filing type and filing sub type
  - update initFiling to check user business permissions
  - add getCommonFilingPayloadData

  ### useManageParties

  - update addNewParty to add a role item if roleType is given

  ### enums

  - update ActionType (removed unused roles)
  - update AuthorizedAction (add OFFICER_CHANGE_FILING)
  - update FilingSubType (add reveiver sub types)
  - add ReceiverType (contains receiver sub types)
  - add RoleTypeUi enum

  ### useBusinessPermissionsStore

  - add permission checks for changeOfOfficers/Receivers/Liquidators

  ### useBusinessStore

  - add isAllowedFiling (moved util here and updated as needed)

  ### utils

  - isFilingAllowed moved into business store
  - several formating funtions added to support BusinessRelationship payloads

## 0.4.0

### Minor Changes

- [#327](https://github.com/bcgov/business-ui/pull/327) [`07320c4`](https://github.com/bcgov/business-ui/commit/07320c4b9732671d14dc236b0320bbe4e450b06c) Thanks [@deetz99](https://github.com/deetz99)! - Fix what modal displays when a filing initialization error occurs

## 0.3.1

### Patch Changes

- [#323](https://github.com/bcgov/business-ui/pull/323) [`5fc2db3`](https://github.com/bcgov/business-ui/commit/5fc2db31fd74762da4a5b63fd923f23ca9df9b86) Thanks [@deetz99](https://github.com/deetz99)! - Add "date" property to filing header payload creation

## 0.3.0

### Minor Changes

- [#318](https://github.com/bcgov/business-ui/pull/318) [`499edd1`](https://github.com/bcgov/business-ui/commit/499edd149a688fb009a2b48b2888866f1acf4ad0) Thanks [@cameron-eyds](https://github.com/cameron-eyds)! - Include liquidation enums for filing and filing sub types

## 0.2.0

### Minor Changes

- [#311](https://github.com/bcgov/business-ui/pull/311) [`1ef56ca`](https://github.com/bcgov/business-ui/commit/1ef56caefd3b319095480cfb48d1b95023bc8d30) Thanks [@cameron-eyds](https://github.com/cameron-eyds)! - Document ID component and schema

## 0.1.20

### Patch Changes

- [#303](https://github.com/bcgov/business-ui/pull/303) [`bce6cfc`](https://github.com/bcgov/business-ui/commit/bce6cfcd7e2ec497d21ecfd2073b6bf61a70a4cf) Thanks [@deetz99](https://github.com/deetz99)! - feat: CourtOrderPoa component and schema

- [#299](https://github.com/bcgov/business-ui/pull/299) [`4d82f2d`](https://github.com/bcgov/business-ui/commit/4d82f2d5be3d54d02adc5ba72acf917427ae5430) Thanks [@deetz99](https://github.com/deetz99)! - feat: Generic editable TableBusiness, TableParty and child components

- [#300](https://github.com/bcgov/business-ui/pull/300) [`29f393d`](https://github.com/bcgov/business-ui/commit/29f393de5458e41f6df16cd5bdc87d309e0585ef) Thanks [@kialj876](https://github.com/kialj876)! - Common filing composable, common business party code, moved filing nav/modals from officers into base layer

- [#306](https://github.com/bcgov/business-ui/pull/306) [`0bd309a`](https://github.com/bcgov/business-ui/commit/0bd309a803dd1cdbe5d8db80a2916d3ab38eb8d3) Thanks [@deetz99](https://github.com/deetz99)! - **New Components:**

  - PartyDetails sub form
  - ManageParties form/table

  **Composables:**

  - useManageParties - controls ManageParties component state/actions

  **CourtOrderPoa**

  - clear validation errors when hasPoa state changes

  **StaffPayment**

  - set required attribute
  - expose method to scroll and move focus to "NO_FEE" radio on form submit error

## 0.1.19

### Patch Changes

- [#301](https://github.com/bcgov/business-ui/pull/301) [`3fd8fb1`](https://github.com/bcgov/business-ui/commit/3fd8fb12a9372ab3db347950bd70d03d4facc303) Thanks [@kialj876](https://github.com/kialj876)! - Business Alerts component bug fix for unknown days

## 0.1.18

### Patch Changes

- [#296](https://github.com/bcgov/business-ui/pull/296) [`3bfcc34`](https://github.com/bcgov/business-ui/commit/3bfcc3417c3f4cf1c72526a379b183d9f960fb27) Thanks [@kialj876](https://github.com/kialj876)! - Business layer: useBusinessApi composable - updates to getParties, useBusinessStore - add folio, errorModal - add error more default config" -s

- [#297](https://github.com/bcgov/business-ui/pull/297) [`5ab625e`](https://github.com/bcgov/business-ui/commit/5ab625ead9abb59cc69a7f086da2afe0c4b7c0b1) Thanks [@deetz99](https://github.com/deetz99)! - feat: FormPartyName component

## 0.1.17

### Patch Changes

- [#288](https://github.com/bcgov/business-ui/pull/288) [`aa26296`](https://github.com/bcgov/business-ui/commit/aa26296522f80dcf6ce5f030e630175320a78594) Thanks [@deetz99](https://github.com/deetz99)! - feat: Reusable folio and certify nested forms

## 0.1.16

### Patch Changes

- [#289](https://github.com/bcgov/business-ui/pull/289) [`4fce5a5`](https://github.com/bcgov/business-ui/commit/4fce5a5695597b7c7d272498e5ecc517ac3da8b1) Thanks [@kialj876](https://github.com/kialj876)! - Business layer - staff modal on submit enhancements

## 0.1.15

### Patch Changes

- [#285](https://github.com/bcgov/business-ui/pull/285) [`9eaed2e`](https://github.com/bcgov/business-ui/commit/9eaed2e8725c7a47ac0eac0e89756ff1df1fe792) Thanks [@kialj876](https://github.com/kialj876)! - Business layer - staff payment updates

## 0.1.14

### Patch Changes

- [#281](https://github.com/bcgov/business-ui/pull/281) [`422d628`](https://github.com/bcgov/business-ui/commit/422d62841dca637484e5388901d22f1902bce614) Thanks [@kialj876](https://github.com/kialj876)! - Business layer - staff payment, ledger wrapper, filing layout updates, pinia-colada integration

- [#279](https://github.com/bcgov/business-ui/pull/279) [`cca6980`](https://github.com/bcgov/business-ui/commit/cca698034b9f0b9214edbec8ea55179a91d01f19) Thanks [@deetz99](https://github.com/deetz99)! - feat: FormAddress with nested option.

## 0.1.13

### Patch Changes

- [#277](https://github.com/bcgov/business-ui/pull/277) [`c0542be`](https://github.com/bcgov/business-ui/commit/c0542bec40e6cbf7dac6559ee7a43e0bba1cd9ed) Thanks [@deetz99](https://github.com/deetz99)! - chore: Update dependencies.

## 0.1.12

### Patch Changes

- [#273](https://github.com/bcgov/business-ui/pull/273) [`6bed0a7`](https://github.com/bcgov/business-ui/commit/6bed0a74959abb8842682a6e964241d2733bd7a6) Thanks [@kialj876](https://github.com/kialj876)! - Tickets: 30910, 30835 (business ledger and business alert components)

- [#275](https://github.com/bcgov/business-ui/pull/275) [`242ec02`](https://github.com/bcgov/business-ui/commit/242ec024063bd3a76c09c48683c3d1d7564cd159) Thanks [@kialj876](https://github.com/kialj876)! - 30835 - added test

## 0.1.11

### Patch Changes

- [#244](https://github.com/bcgov/business-ui/pull/244) [`370c175`](https://github.com/bcgov/business-ui/commit/370c175d07d03b61723e36c0a404caa19f20a182) Thanks [@deetz99](https://github.com/deetz99)! - Set Header and Breadcrumb default text to be 'BC Registries and Online Services' instead of 'SBC Connect'

- [#244](https://github.com/bcgov/business-ui/pull/244) [`370c175`](https://github.com/bcgov/business-ui/commit/370c175d07d03b61723e36c0a404caa19f20a182) Thanks [@deetz99](https://github.com/deetz99)! - Add business edit url to nuxt config, remove officer only i18n labels, add company info page i18n label

## 0.1.10

### Patch Changes

- [#242](https://github.com/bcgov/business-ui/pull/242) [`87dfb3a`](https://github.com/bcgov/business-ui/commit/87dfb3abfde4449d8b48ebf68b750c39b5f4240f) Thanks [@deetz99](https://github.com/deetz99)! - Rename validateBusinessAllowedFilings util to isFilingAllowed, add/fix tsdocs for some methods, fix padding in button control in filing layout

## 0.1.9

### Patch Changes

- [#237](https://github.com/bcgov/business-ui/pull/237) [`44eaf88`](https://github.com/bcgov/business-ui/commit/44eaf88094adf0a56577f171555306b099bc1604) Thanks [@deetz99](https://github.com/deetz99)! - Update pay/forms layer deps

## 0.1.8

### Patch Changes

- [#235](https://github.com/bcgov/business-ui/pull/235) [`92fcc09`](https://github.com/bcgov/business-ui/commit/92fcc09d92806aca8b3ef29ffd96fb1a390baf97) Thanks [@deetz99](https://github.com/deetz99)! - Update nuxt-pay dep.

## 0.1.7

### Patch Changes

- [#230](https://github.com/bcgov/business-ui/pull/230) [`248a325`](https://github.com/bcgov/business-ui/commit/248a325b8c946aa9a4db4c9948ac28459e6a0354) Thanks [@deetz99](https://github.com/deetz99)! - Update deps, add testids to button control

## 0.1.6

### Patch Changes

- [#227](https://github.com/bcgov/business-ui/pull/227) [`ddf1216`](https://github.com/bcgov/business-ui/commit/ddf1216f377632d8483ebc9199898074d521511e) Thanks [@deetz99](https://github.com/deetz99)! - Update connect layers deps, use connect tombstone, create filing tombstone helper composable, move business auth info fetch into business api composable. issue: bcgov/entity#29341

## 0.1.5

### Patch Changes

- [#220](https://github.com/bcgov/business-ui/pull/220) [`c0a0515`](https://github.com/bcgov/business-ui/commit/c0a0515e9b62bd9150206c9ea81429add6a28d97) Thanks [@deetz99](https://github.com/deetz99)! - Refactor all person-roles common components, interfaces, composables, utils, etc into business layer. issue: bcgov/entity#29341

## 0.1.4

### Patch Changes

- [#216](https://github.com/bcgov/business-ui/pull/216) [`07f8251`](https://github.com/bcgov/business-ui/commit/07f8251a23dd1fa6bbf510e5c54dad4a3a6a282e) Thanks [@deetz99](https://github.com/deetz99)! - Update deps and add css module. issue: bcgov/entity#29341

## 0.1.3

### Patch Changes

- [#212](https://github.com/bcgov/business-ui/pull/212) [`a484bba`](https://github.com/bcgov/business-ui/commit/a484bba34fa3795472a6ff9e8d3bed38a7521b50) Thanks [@deetz99](https://github.com/deetz99)! - Add test setup to base layer and init base layer CI. issue: bcgov/entity#29333

## 0.1.2

### Patch Changes

- [#210](https://github.com/bcgov/business-ui/pull/210) [`a5dbbea`](https://github.com/bcgov/business-ui/commit/a5dbbea55377822027a3246837e2765ace0d6e0a) Thanks [@deetz99](https://github.com/deetz99)! - Create shared test configs. issue: bcgov/entity#29332

## 0.1.1

### Patch Changes

- [#206](https://github.com/bcgov/business-ui/pull/206) [`535bd78`](https://github.com/bcgov/business-ui/commit/535bd780e4b2129497fada000a2b72769ede5320) Thanks [@deetz99](https://github.com/deetz99)! - Add connect-nuxt layers issue:bcgov/entity#29332
