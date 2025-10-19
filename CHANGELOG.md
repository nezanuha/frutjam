# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.7.1-beta.0] - 2025-10-19

### Added

- Introduced new `divider-info` variant for UI divider styling

### Fixed

- Fixes "Unexpected token CurlyBracketBlock" warning
- Add missing semicolon in the CSS for the `.input-disable` class
- Fixes drawer width when no placement utility is assigned with the drawer component

## [2.7.0-beta.1] - 2025-09-24

### Fixed

- Corrected incorrect variable assignment for divider color

## [2.7.0-beta.0] - 2025-09-24

### Added

- You can now import all safelists using `import 'frutjam/safelist'`. This makes it easier to generate and use all Frutjam utility classes, especially when working with Markdown content or static analysis tools.
- Added support for `card-{primary, secondary, accent, info, neutral, success, warning, error}` utility classes to style cards with semantic colors.

## [2.6.0-beta.0] - 2025-08-21

### Added

- Added new `table` component for displaying tabular data.
- chore: update preflight to improve base styling and consistency

## [2.5.0-beta.7] - 2025-08-11

### Fixed

- Corrects misassigned target classes for dropdown-body

## [2.5.0-beta.6] - 2025-08-11

### Changed

- reduce sidebar padding for improved layout spacing

### Fixed

- fix(drawer): enable scroll on drawer-body when content overflows
- fix: prevent sidebar content from being cut off when scrolling to bottom by adjusting max-height
- Fixed issue where default checkbox outline was not visible in dark mode.

## [2.5.0-beta.5] - 2025-08-08

### Fixed

- Corrects the size of the `container-full` utility.

## [2.5.0-beta.4] - 2025-08-07

### Fixed

- Corrects the size of the `container` utility.

## [2.5.0-beta.3] - 2025-08-06

### Fixed

- TailwindCSS prefix issue: Nested utility classes inside components were not being automatically prefixed when using the `tw` prefix. A temporary patch was applied using a class attribute selector workaround until an official fix is released by TailwindCSS.

## [2.5.0-beta.2] - 2025-08-03

### Changed

- Removed default surface-md size when no size is assigned; now only the assigned size takes effect

## [2.5.0-beta.1] - 2025-08-02

### Changed

- This update helps to simplify the button component's structure and behavior, improving flexibility for customization and reducing unnecessary styles

## [2.5.0-beta.0] - 2025-08-02

### Added

- Utility levels: `surface-1`, `surface-2`, and base `surface` 
- Size variants: `surface-sm`, `surface-md`, ..., `surface-xl` 
- Border styles: `surface-outline` and `surface-dashed` 
- `surface-rounded` to apply global `border-radius` style

### Fixed

- Corrected file paths for 'main', 'browser', and 'styles' in package.json

### Changed

- Restructured `surface` from a utility to a standalone component 
- refactor: align card border color with global style
- Disabled automatic source detection and limited CSS processing to the src folder to avoid including unnecessary styles
- CDN-ready CSS without preflight
- Restructured code for improved organization and readability

## [2.4.0-beta.0] - 2025-07-31

### Added

- Introducing new utilities: `surface` (base), `surface-1`, and `surface-2`

## [2.3.0-beta.1] - 2025-07-31

### Added

- Added base styling for the `<code>` element

### Fixed

- fix: add missing `container` utility (same as `container-md`)
- The `container` class was broken due to a naming conflict with Tailwind CSS’s `container` variable. This issue was resolved by prefixing the internal `container` variable with `ui`, avoiding the conflict.

## [2.3.0-beta.0] - 2025-07-30

### Added

- Added background color to footer using the `--color-base` variable in preflight
- Introduces `focus-or-within` variant to apply styles on `:focus` or `:focus-within`
- Added a new dropdown component currently in experimental stage

### Changed

- Refactor: create separate `navbar-list` class to improve editor support and highlight while typing
- feat: set accordion to full width for improved layout
- The container is now considered a utility. Use classes like `container-lg` instead of `container container-lg`
- Changed base color in darkberry theme to optimize user experience in low-light conditions

### Fixed

- Added `width` and `height` to the divider base component to fix layout issues; the divider now occupies the intended space and is no longer affected by `align-items: center` on the parent.
- The `align-self: flex-start` rule was preventing buttons from being vertically centered when their parent had `align-items: center`. Removing it allows proper alignment in those cases.
- Corrected the modal component to use a valid CSS opacity value

## [2.2.0-beta.0] - 2025-07-25

### Added

- Applied `--color-base` as the background color to the main element
- Added the default color for `<p>` tags in the preflight styles to match the UI's design consistency

### Removed

- Revised the `heading` and `para` utility to remove the fixed color, allowing user-defined colors to be applied more easily without needing !important
- Removed the `color` property from the child elements of the `<details>` in the accordion component. Now, the color is inherited from the root to ensure consistency with the UI and maintain a cohesive design throughout
- Removed the `background-color` and `padding-top` from the `summary` inside the `<p>` tag in the accordion component to improve the UI design

## [2.1.0-beta.0] - 2025-07-24

### Changed

- `nav-list` has been renamed to `navbar-list` to align with the navbar component and eliminate confusion
- Enable dark variant using data-theme attribute instead of media query
- Adjust the shade to achieve a balanced and cohesive color palette
- Replaced fixed line-heights with font-size-based line-heights for all button sizes in the `btn` component to ensure consistent vertical alignment and better scalability across font sizes
- Enhanced soft color appearance across dark and light themes

### Fixed

- fix: ensure fallback snowberry theme doesn't override color variables when a data-theme is specified
- Fixed incorrect badge line-height that resulted in incorrect badge sizes

## [2.0.0-beta.0] - 2025-07-23

### Added

- Components and utility classes now support prefixes. Example usage: `tw:btn`, `tw:btn-primary`
  Configured via: `@import "tailwindcss" prefix("tw")`
- Expanded typography utilities with heading-[{size}] and para-[{size}] for arbitrary size support
- A CDN version of the CSS is now available for fast and easy integration without local setup

### Changed 

- Now only base colors like `--color-primary` and `--color-on-primary` need to be defined; the library automatically generates shades from `50` to `950`
- Now, simply set a single `border-radius` value in the theme; the Frutjam library automatically applies and adjusts radius values across components for optimal UI consistency
- `nav` has been renamed to `navbar` for improved clarity and consistency

### Removed

- Removed manual border-radius variables for individual components (`--radius-btn`, `--radius-input`, `--radius-checkbox`, etc.)
- Removed manual color shade variables like `--primary-100` to `--primary-950`, `--secondary-100` to `--secondary-950`, etc.
- Deprecated and removed the surface component; use bg-primary-{50..950} instead

---

[Unreleased]: https://github.com/nezanuha/frutjam/compare/v2.7.1-beta.0...HEAD
[2.7.1-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.7.0-beta.1...v2.7.1-beta.0
[2.7.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v2.7.0-beta.0...v2.7.0-beta.1
[2.7.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.6.0-beta.0...v2.7.0-beta.0
[2.6.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.7...v2.6.0-beta.0
[2.5.0-beta.7]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.6...v2.5.0-beta.7
[2.5.0-beta.6]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.5...v2.5.0-beta.6
[2.5.0-beta.5]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.4...v2.5.0-beta.5
[2.5.0-beta.4]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.3...v2.5.0-beta.4
[2.5.0-beta.3]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.2...v2.5.0-beta.3
[2.5.0-beta.2]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.1...v2.5.0-beta.2
[2.5.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v2.5.0-beta.0...v2.5.0-beta.1
[2.5.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.4.0-beta.0...v2.5.0-beta.0
[2.4.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.3.0-beta.1...v2.4.0-beta.0
[2.3.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v2.3.0-beta.0...v2.3.0-beta.1
[2.3.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.2.0-beta.0...v2.3.0-beta.0
[2.2.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.1.0-beta.0...v2.2.0-beta.0
[2.1.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v2.0.0-beta.0...v2.1.0-beta.0
[2.0.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.5.0-beta.0...v2.0.0-beta.0
[1.5.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.4.0-beta.0...v1.5.0-beta.0
[1.4.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.3.0-beta.0...v1.4.0-beta.0
[1.3.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.2.0-beta.0...v1.3.0-beta.0
[1.2.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.1.0-beta.0...v1.2.0-beta.0
[1.1.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v1.0.0-beta.0...v1.1.0-beta.0
[1.0.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.14.0-beta.0...v1.0.0-beta.0
[0.14.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.13.0-beta.0...v0.14.0-beta.0
[0.13.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.12.0-beta.0...v0.13.0-beta.0
[0.12.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.11.0-beta.0...v0.12.0-beta.0
[0.11.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.10.0-beta.2...v0.11.0-beta.0
[0.10.0-beta.2]: https://github.com/nezanuha/frutjam/compare/v0.10.0-beta.1...v0.10.0-beta.2
[0.10.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v0.10.0-beta.0...v0.10.0-beta.1
[0.10.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.9.0-beta.0...v0.10.0-beta.0
[0.9.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.6...v0.9.0-beta.0
[0.8.1-beta.6]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.5...v0.8.1-beta.6
[0.8.1-beta.5]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.4...v0.8.1-beta.5
[0.8.1-beta.4]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.3...v0.8.1-beta.4
[0.8.1-beta.3]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.2...v0.8.1-beta.3
[0.8.1-beta.2]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.1...v0.8.1-beta.2
[0.8.1-beta.1]: https://github.com/nezanuha/frutjam/compare/v0.8.1-beta.0...v0.8.1-beta.1
[0.8.1-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.8.0-beta.4...v0.8.1-beta.0
[0.8.0-beta.4]: https://github.com/nezanuha/frutjam/compare/v0.8.0-beta.3...v0.8.0-beta.4
[0.8.0-beta.3]: https://github.com/nezanuha/frutjam/compare/v0.8.0-beta.2...v0.8.0-beta.3
[0.8.0-beta.2]: https://github.com/nezanuha/frutjam/compare/v0.8.0-beta.1...v0.8.0-beta.2
[0.8.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v0.8.0-beta.0...v0.8.0-beta.1
[0.8.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.5...v0.8.0-beta.0
[0.7.0-beta.5]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.4...v0.7.0-beta.5
[0.7.0-beta.4]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.3...v0.7.0-beta.4
[0.7.0-beta.3]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.2...v0.7.0-beta.3
[0.7.0-beta.2]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.1...v0.7.0-beta.2
[0.7.0-beta.1]: https://github.com/nezanuha/frutjam/compare/v0.7.0-beta.0...v0.7.0-beta.1
[0.7.0-beta.0]: https://github.com/nezanuha/frutjam/compare/v0.7.0-alpha.0...v0.7.0-beta.0
[0.7.0-alpha.0]: https://github.com/nezanuha/frutjam/compare/v0.6.0-alpha.2...v0.7.0-alpha.0
[0.6.0-alpha.2]: https://github.com/nezanuha/frutjam/compare/v0.6.0-alpha.1...v0.6.0-alpha.2
[0.6.0-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.5.0-alpha.1...v0.6.0-alpha.1
[0.5.0-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.5.0-alpha.0...v0.5.0-alpha.1
[0.5.0-alpha.0]: https://github.com/nezanuha/frutjam/compare/v0.4.0-alpha.1...v0.5.0-alpha.0
[0.4.0-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.4.0-alpha.0...v0.4.0-alpha.1
[0.4.0-alpha.0]: https://github.com/nezanuha/frutjam/compare/v0.3.0-alpha.3...v0.4.0-alpha.0
[0.3.0-alpha.3]: https://github.com/nezanuha/frutjam/compare/v0.3.0-alpha.2...v0.3.0-alpha.3
[0.3.0-alpha.2]: https://github.com/nezanuha/frutjam/compare/v0.3.0-alpha.1...v0.3.0-alpha.2
[0.3.0-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.2.0-alpha.4...v0.3.0-alpha.1
[0.2.0-alpha.4]: https://github.com/nezanuha/frutjam/compare/v0.1.1-alpha.4...v0.2.0-alpha.4
[0.1.1-alpha.4]: https://github.com/nezanuha/frutjam/compare/v0.1.1-alpha.3...v0.1.1-alpha.4
[0.1.1-alpha.3]: https://github.com/nezanuha/frutjam/compare/v0.1.1-alpha.2...v0.1.1-alpha.3
[0.1.1-alpha.2]: https://github.com/nezanuha/frutjam/compare/v0.1.1-alpha.1...v0.1.1-alpha.2
[0.1.1-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.1.0-alpha.1...v0.1.1-alpha.1
[0.1.0-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.0.8-alpha.2...v0.1.0-alpha.1
[0.0.8-alpha.2]: https://github.com/nezanuha/frutjam/compare/v0.0.8-alpha.1...v0.0.8-alpha.2
[0.0.8-alpha.1]: https://github.com/nezanuha/frutjam/compare/v0.0.5...v0.0.8-alpha.1
[0.0.5]: https://github.com/nezanuha/frutjam/releases/tag/v0.0.5