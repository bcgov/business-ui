[![License](https://img.shields.io/badge/License-BSD%203%20Clause-blue.svg)](LICENSE)

# @sbc-connect/nuxt-business-base
The foundational Nuxt layer for all Business applications.

This package contains the core UI components, styling, and utilities for Business applications. Extend this layer in your Nuxt project to get a consistent, on-brand starting point with minimal configuration.

## Features

### BC Government Branding
- Official color theme and design tokens
- BCSans font family with pre-configured @font-face rules
- BC Government logos and favicon assets

### Core Development Assets
- A library of reusable base components
- Essential composables for common application logic
- Standard utility functions
- Pre-configured for Internationalization (i18n)

### Business Specific

Such as:
- `$businessApi` fetch plugin
- `useBusinessApi` composable with several common fetch methods.
- Business Filing page layout

For detailed usage and documentation, please see the [Business Base Layer Docs](https://github.com/bcgov/business-ui/blob/main/docs/packages/layers/base/overview.md)

## Usage

### Install
```bash
pnpm install @sbc-connect/nuxt-business-base
```

> [!NOTE]
> If the application is in the [business-ui](https://github.com/bcgov/business-ui) repo, you may access the layer directly by adding the application to the repo's [workspace](https://github.com/bcgov/business-ui/blob/main/pnpm-workspace.yaml) and referencing the dependency by the `workspace:*` protocol (e,g,. `"@sbc-connect/nuxt-business-base": "workspace:*",`). This is not necessary but enables instant updates between the layer and application.

### Configure
Then add the dependency to `extends` in `nuxt.config`:

> [!NOTE]
> `@sbc-connect/nuxt-business-base` already includes `@sbc-connect/nuxt-forms` and `@sbc-connect/nuxt-pay`, it is not necessary to install these packages separately.

```ts
defineNuxtConfig({
  extends: '@sbc-connect/nuxt-business-base'
})
```

### nuxt-forms & nuxt-pay

Included in `nuxt-forms` and `nuxt-pay` is `nuxt-base` and `nuxt-auth`. This setup provides a complete starting point for all Business/Connect applications.

Please see the individual packages for more information:

- [@sbc-connect/nuxt-forms](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/forms/README.md)
- [@sbc-connect/nuxt-pay](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/pay/README.md)
- [@sbc-connect/nuxt-base](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/base/README.md)
- [@sbc-connect/nuxt-auth](https://github.com/bcgov/connect-nuxt/blob/main/packages/layers/auth/README.md)

### Environment Variables
This project requires certain environment variables to be set to run correctly.

Create a file named .env in the root of the project.

#### Local Development
Copy the contents of the **.env.example** file into your new .env file.

#### Production Environments
> [!IMPORTANT]
> The values for staging and production environments are managed securely and should not be stored in this file.

To obtain the correct values for a production build or deployment, please contact the Connect Platform or Entity Team.

## Contributing

We welcome and encourage contributions to this shared layer! Before you start, please be sure to read the main repository's [Contribution Guidelines](https://github.com/bcgov/business-ui/blob/main/CONTRIBUTING.MD) for information on our branching strategy, commit/code conventions, and pull request process.

### Guidelines for This Layer

To keep this package lean, maintainable, and easy to use, please follow these specific rules when contributing:

**Purpose:** This layer is for **truly common or shared logic and components only**. If a feature or component is only used by a single application, it belongs in that application's codebase, not here.

**Changesets are Required:**
  > [!IMPORTANT]
  > Every Pull Request that includes a code change (bug fix, new feature, etc.) **must** include a changeset file. This is essential for the release process. A detailed guide can be found at [A Guide to the Changesets Workflow](https://github.com/bcgov/business-ui/blob/main/docs/changesets/workflow.md).

**Include Tests:** All new features or bug fixes must include corresponding unit and/or end-to-end tests to ensure they are working correctly and prevent future regressions.

**Add Examples:** If you are adding a new component or a complex composable, please add a clear example of its usage in the layer's playground directory. This is the best way to document its functionality for other developers.

**Update Documentation:** Please add a summary of your changes to the main [overview](https://github.com/bcgov/business-ui/blob/main/docs/packages/layers/base/overview.md). Depending on complexity, please create a new, specific documentation file and link to it from the overview. This is the best place for detailed information, usage examples, and any "gotchas."