<!-- omit in toc -->
# Contributing to Business UI

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. We look forward to your contributions. 🎉

<!-- omit in toc -->
## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Want To Contribute](#i-want-to-contribute)
- [How to Contribute](#how-to-contribute)
- [Code Style and Standards](#code-style-and-standards)
- [Internationalization](#internationalization)
- [Accessibility](#accessibility)
- [Responsive Design](#responsive-design)
<!-- - [Improving The Documentation](#improving-the-documentation)
- [Commit Messages](#commit-messages)
- [Join The Project Team](#join-the-project-team) -->


## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](./CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior
to <>. Add contact?

## I Want To Contribute

### How to Contribute

Government employees, public and members of the private sector are encouraged to contribute to the repository by **forking and submitting a pull request**.

(If you are new to GitHub, you might start with a [basic tutorial](https://docs.github.com/en/get-started/getting-started-with-git/set-up-git) and check out a more detailed guide to [pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).)

Pull requests will be evaluated by the repository guardians on a schedule and if deemed beneficial will be committed to the master.

All contributors retain the original copyright to their stuff, but by contributing to this project, you grant a world-wide, royalty-free, perpetual, irrevocable, non-exclusive, transferable license to all users **under the terms of the license under which this project is distributed**.

### Submitting Your Contribution

1. Ensure your code follows the project's [style](#code-style-and-standards) and conventions, including [internationalization](#internationalization), [accessibility](#accessibility), and [responsive design](#responsive-design).
2. Write or update tests as needed.
3. Document your changes, including new features, changes to existing features, and any breaking changes.
4. Submit a pull request to the main branch.
5. In your pull request, describe the changes you made and why they are necessary.
6. Wait for feedback and be responsive to any review comments.

### Code Style and Standards

- All code should be written in Vue 3 using the [composition API](https://vuejs.org/guide/extras/composition-api-faq.html), adhering to best practices and naming conventions.
- Ensure all components, composables, utilities, and other code are written in TypeScript.
- Follow the [recommended](https://nuxt.com/docs/guide/directory-structure/nuxt) file structure for Nuxt 4 projects.
- Use ESLint to enforce code style and formatting.
- Use the Nuxt ecosystem of modules when/if available.
- Write unit tests for all components, composables, stores, utilities, etc using [Vitest](https://vitest.dev/) and [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing?utm_source=nuxt.com&utm_medium=aside-module&utm_campaign=nuxt.com), supplemented with [@tesing-library/vue](https://testing-library.com/docs/vue-testing-library/intro/) and aim for high test coverage.
- Document all composables, and utilities with JSDoc comments.
- Use [Tailwind CSS](https://tailwindcss.com/) for styling, and follow the project's established design system and utility classes.
- Prefer using [Nuxt Modules](https://nuxt.com/modules) for adding functionality and integrations, and avoid custom implementations unless necessary.
- Use environment variables for configuration settings, and never hard-code sensitive information or credentials in the codebase.
- Regularly update dependencies to their latest versions to ensure security and stability.

### Internationalization

- Ensure all text content is translated using the i18n framework to manage translations.
- Use the `$t` function for translation strings within your components.
- Add new translation keys to the appropriate language files in the locales directory.
- Follow the established patterns for structuring and naming translation keys.

### Accessibility

- Follow accessibility best practices to ensure that the application is usable by people with disabilities.
- Use semantic HTML elements and attributes correctly.
- Ensure that all interactive elements are keyboard accessible.
- Provide appropriate ARIA roles, states, and properties where necessary.
- Use [color contrast checkers](https://www.whocanuse.com/) to ensure that text meets WCAG AA guidelines for contrast.
- Test your changes with screen readers and other assistive technologies.

### Responsive Design

- Design and implement components with a mobile-first approach.
- Use CSS media queries to adapt layouts for different screen sizes.
- Ensure that components are flexible and can resize appropriately based on their container size.
- Test your changes on various devices and screen sizes to ensure a consistent and functional user experience.
- Use relative units (e.g., %, em, rem) rather than fixed units (e.g., px) to allow for better scalability and responsiveness.

<!-- TODO
### Improving The Documentation
Updating, improving and correcting the documentation

-->

<!-- omit in toc -->
## Attribution
This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!