# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Added
- Utility levels: `surface-1`, `surface-2`, and base `surface` 
- Size variants: `surface-sm`, `surface-md`, ..., `surface-xl` 
- Border styles: `surface-outline` and `surface-dashed` 
- `surface-rounded` to apply global `border-radius` style 

## Changed
- Restructured `surface` from a utility to a standalone component 
- refactor: align card border color with global style
- Disabled automatic source detection and limited CSS processing to the src folder to avoid including unnecessary styles

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
