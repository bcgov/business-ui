# Overview of @sbc-connect/nuxt-business-base
@sbc-connect/nuxt-business-base is designed to provide a standardized set of configurations, components, and utilities for Business applications.

<!-- omit in toc -->
## Table of Contents

- [Extended Layers](#extended-layers)
- [Components](#components)
- [Composables](#composables)
- [Stores](#stores)
- [Layouts](#layouts)
- [Plugins](#plugins)
- [Utils](#utils)
- [Enums, Interfaces and Types](#enums-interfaces-and-types)

## Extended Layers
- [@sbc-connect/nuxt-pay](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/pay/README.md)
- [@sbc-connect/nuxt-forms](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/forms/README.md)

## Components

- ModalError
  - Note: Though not necessary, this component is meant to be used alongside the `useModal` composable.
  - [Examples](../../../../packages/layers/base/.playground/app/pages/examples/components/Modal/Error.vue)

## Composables

- [useBusinessApi](./composables/useBusinessApi.md)
- useFilingTombstone
- useModal

## Stores

- None at this time

## Layouts

- filing
  - [Examples](../../../../packages/layers/base/.playground/app/pages/examples/layouts/filing.vue)

## Plugins

- [Business API fetch](./plugins/business-api.md): `$businessApi`

## Utils

- getErrorStatus: Safely extracts the HTTP status code from a thrown error.
- corp-info
  - getCorpInfoObject
  - getCorpFullDescription
  - getCorpNumberedDescription
- date
  - getToday: Gets todays date, can customize timezone and output format.
- isFilingAllowed: Validates if a specific filing type is allowed for a given business based on its `allowedActions` property.
- isValidDraft: A type guard that validates if an API response is a valid and usable draft filing.

## Enums, Interfaces and Types

Several common enums, interfaces and types specific to Business applications.