<!-- omit in toc -->
# Contributing to Person Roles UI

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. We forward to your contributions. 🎉

<!-- omit in toc -->
## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
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


## I Have a Question

> If you want to ask a question, we assume that you have read the available [readme](./README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/bcgov/business-ui/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/bcgov/business-ui/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

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

### Reporting Bugs

<!-- omit in toc -->
#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [readme](./README.md). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/bcgov/business-ui/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
- Stack trace (Traceback)
- OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
- Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
- Possibly your input and the output
- Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to <>. ADD CONTACT?

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/bcgov/business-ui/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Person Roles UI, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

<!-- omit in toc -->
#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [readme](./README.md) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/bcgov/business-ui/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/bcgov/business-ui/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- **Explain why this enhancement would be useful** to Person Roles UI users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Code Style and Standards

- All code should be written in Vue 3 using the [composition API](https://vuejs.org/guide/extras/composition-api-faq.html), adhering to best practices and naming conventions.
- Ensure all components, composables, utilities, and other code are written in TypeScript.
- Follow the recommended [file structure](https://nuxt.com/docs/guide/directory-structure/nuxt) for Nuxt 3 projects.
- Use ESLint to enforce code style and formatting.
- Write unit tests for all components, composables, stores, utilities, etc using [Vitest](https://vitest.dev/) and [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing?utm_source=nuxt.com&utm_medium=aside-module&utm_campaign=nuxt.com), supplemented with [@testing-library/vue](https://testing-library.com/docs/vue-testing-library/intro/) and aim for high test coverage.
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
- Use color contrast checkers to ensure that text meets WCAG AA guidelines for contrast.
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