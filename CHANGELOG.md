# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-10

### Changed (infrastructure)

- **`package.json`**: Removed `"main"` field (conflicted with `"exports"."."` pointing to `dist/plugin.js`); `"frutjam/postcss"` still resolves `index.js` for PostCSS usage; added `"engines": { "node": ">=18" }`; added `build:plugin` and `build` scripts; `prepublishOnly` now runs both CDN and plugin builds
- **`build-plugin.mjs`**: New build script — compiles all components and utilities through Tailwind, converts CSS to JS objects via `postcss-js`, and outputs `dist/plugin.js` (bundled Tailwind v4 plugin), per-component `dist/components/*/index.js`, per-utility `dist/utilities/*/index.js`, per-theme `dist/themes/*/index.js`, and `dist/base/tokens/index.js` / `dist/base/reboot/index.js`

### Fixed

- **`--color-*-soft` dark mode**: Dark-mode soft colors (`--color-*-soft`) were near-invisible — previously resolved to `*-950` (80% black, nearly matching the page background); now computed as `color-mix(in srgb, var(--color-*) 20%, var(--color-base) 80%)` for a clearly distinguishable tinted surface; `in srgb` used instead of `oklch` to avoid hue-interpolation artifacts on themed dark backgrounds
- **`--color-base-active` visibility**: Bumped light-mode mix from 15% → 20% and dark-mode from 28% → 35% so form control borders (radio, checkbox) and interactive states are visible
- **`--color-body`**: Renamed from `--color-p` throughout (`tokens.css`, `reboot.css`, `typography.css`, `breadcrumb`) — name now reflects its use as general body text color, not just paragraphs
- **`toggle`**: Track color changed from `--color-base-active` to `--color-base-300` — the "off" state needs a clearly visible track, not a subtle hover overlay
- **`popover` placements**: Top and bottom `position-area` values replaced with explicit logical axis keywords (`block-start`, `block-end`, `span-inline-start`, `span-inline-end`) — Chrome was misinterpreting ambiguous `start`/`end` as the first value in a two-value `position-area` as inline-axis instead of block-axis, causing bottom placements to render over the trigger
- **`breadcrumb`**: Hardcoded `light-dark(var(--color-base-900), var(--color-base-200))` replaced with `var(--color-body)` for theme-consistent text color; links now use gradient underline animation (matching `link` component) instead of `text-decoration`
- **`btn-link`**: Underline replaced with sliding gradient animation — slides in from right on hover, retracts right-to-left on unhover (consistent with `link` component behavior)
- **`card`**: Added `card-body` as backward-compatible alias for `card-content`; `card-footer` now uses `margin-block-start: auto` instead of top padding for proper flex positioning
- **`divider-vertical`**: Added `align-self: stretch` so vertical dividers fill the height of their flex container; added `height` variable to base structure
- **`menu-title`**: Fixed inverted `light-dark()` values — was showing light color in light mode and dark color in dark mode
- **`modal`**: Replaced flat 1px shadow with a two-layer box-shadow (4px blur + 32px spread) for depth in both light and dark themes
- **`textarea`**: `min-height` extracted to `--textarea--min-height` variable; each size variant now sets an appropriate min-height (xs: 3rem → 2xl: 10rem)
- **`avatar`**: Removed mask shape utilities (`avatar-mask-squircle`, `avatar-mask-hexagon`, `avatar-mask-triangle`) — use Tailwind's `mask-*` utilities instead

## [Unreleased]

### Changed (infrastructure)

- **`@plugin "frutjam" { ... }` CSS syntax**: Plugin options (`prefix`, `reset`, `root`, `logs`, `include`, `exclude`) can now be configured directly in CSS via an `@plugin "frutjam" { ... }` block — CSS-level options override options passed to the PostCSS factory; the `@plugin` node is removed from the output
- **Themes via `@layer theme`**: Custom themes can now be defined directly in CSS using `@layer theme { [data-theme="name"] { ... } }` — the `themes` option in `postcss.config.js` is no longer needed for theme definitions
- **Per-component CDN files**: `build-cdn.mjs` now produces individual CSS files per component (`dist/components/button.css`, etc.), per utility (`dist/utilities/`), per theme (`dist/themes/darkberry.css`, `dist/themes/snowberry.css`), and a shared `dist/base.css` — compatible with jsDelivr combine URLs; component files contain only frutjam CSS (no Tailwind utility classes)
- **Source structure**: Reorganized `src/` — `preflight.css` renamed to `reboot.css` (browser reset + element defaults); `tokens.css` split out as pure CSS vars / color scales; animations moved to `base/animations/`; utilities flattened from `utilities/[name]/base.css` to `utilities/[name].css`; `theme/jams/` flattened to `theme/`; `typography.css` moved to `utilities/`; entry folder removed (build handled entirely in `index.js`)
- **Plugin options**: Added `reset` (default `true`), `root` (default `":root"`), `logs` (default `true`), `include`, and `exclude` options to the PostCSS plugin
- **`reset: false`**: Skips browser reset and element defaults (`p`, `code`, `strong`, etc.) — use alongside Bootstrap or other CSS frameworks to prevent style conflicts
- **`root`**: Remaps all `:root` CSS var declarations to a custom selector (e.g. `".my-editor"` or `":host"`) for scoped/embedded use cases
- **`logs: false`**: Suppresses the build-time console output
- **`include` / `exclude`**: Whitelist or blacklist specific components and utilities (comma-separated string or array); components and utilities are now auto-discovered from the filesystem — no manual registry needed
- **`build-cdn.mjs`**: Fixed broken `src/frutjam.css` reference; removed duplicate imports and duplicated `resolveImports`; utility extraction now runs frutjam plugin directly

### Changed

- **`link`**: Underline now uses `background-image` gradient instead of `text-decoration` for consistent thickness; `link-hover` animates underline sliding in from left on hover and retracting left-to-right on unhover; `forced-colors` fallback restored for accessibility
- **`radio`**: Fixed typo (`currerntcolor`), cleaned up duplicate `background-color` declaration, fixed `radio-disabled` state (was referencing undefined CSS vars), restored `radio-circle` / `radio-rounded` / `radio-square` shape variants, default radius now uses `--radius-radio` to match theme
- **`tag`**: `tag-remove` now uses `currentColor` for color and background — correctly inherits text color for all variants (solid, soft, outline); removed unused `--color-tag-active` variable
- **`card`**: Added `--color-on-card` token (defaults to `--color-on-base`)
- **`preflight`**: Paragraph color extracted into `--color-p` CSS variable on `[data-theme]` for reuse across components
- **`typography`**: `--tw-prose-body` updated to use `--color-p`; `--tw-prose-hr` uses `--color-base-soft`; fixed `--tw-prose-code` from `--color-base` to `--color-on-base`

### Breaking Changes


- **`countdown`**: CSS variable renamed from `--value` to `--countdown-value` to avoid global `@property` collision
- **`radial-progress`**: CSS variable renamed from `--value` to `--progress-value`; `--size` and `--thickness` remain unchanged
- **`join`**: Removed `--join--radius` CSS variable from `btn`, `card`, `input`, `select`, and `textarea` — join corner radius is now derived automatically from each element's natural `border-radius`
- **`accordion`**: `accordion-body` renamed to `accordion-content`
- **`alert`**: `alert-x` renamed to `alert-horizontal`; `alert-y` renamed to `alert-vertical`
- **`card`**: `card-body` renamed to `card-content`; CSS variables `--card-body-padding` and `--card-body-font-size` renamed to `--card-content-padding` and `--card-content-font-size`
- **`divider`**: `divider-x` renamed to `divider-horizontal`; `divider-y` renamed to `divider-vertical`
- **`drawer`**: `drawer-body` renamed to `drawer-content`
- **`footer`**: `footer-x` renamed to `footer-horizontal`; `footer-y` renamed to `footer-vertical`
- **`header`**: `header-body` renamed to `header-content`
- **`hero`**: `hero-body` renamed to `hero-content`
- **`join`**: `join-x` renamed to `join-horizontal`; `join-y` renamed to `join-vertical`
- **`menu`**: `menu-x` renamed to `menu-horizontal`; `menu-y` renamed to `menu-vertical`
- **`modal`**: `modal-body` renamed to `modal-content`; placement classes renamed — `modal-x-start/center/end` → `modal-start/center/end`; `modal-y-start/center/end` → `modal-top/middle/bottom`; CSS variables `--modal-body--*` renamed to `--modal-content--*`
- **`navbar`**: Placement classes renamed — `navbar-x-start/center/end` → `navbar-start/center/end`; `navbar-y-start/center/end` → `navbar-top/middle/bottom`; `navbar-y-center` → `navbar-middle`
- **`popover`**: `popover-body` renamed to `popover-content`; `--color-popover-active` renamed to `--color-popover-border`; removed built-in arrow/caret
- **`tooltip`**: `tooltip-body` renamed to `tooltip-content`; CSS variable `--tooltip-body` renamed to `--tooltip-content`

### Added

- **`status`**: New status dot component for presence/state indicators (online, offline, busy, etc.); supports color variants (`status-primary` → `status-error`) and size variants (`status-xs` → `status-xl`); uses `outline` ring separator for clean appearance on any background
- **`indicator`**: New indicator/overlay component for positioning badges over other elements; supports placement modifiers (`indicator-start/end/center`, `indicator-top/middle/bottom`)
- **`carousel`**: New scroll-snap carousel component with `carousel-item` children; supports `carousel-vertical`, `carousel-center`, and `carousel-end` variants
- **`combobox`**: New searchable dropdown component with `combobox-list`, `combobox-option`, and `combobox-open` classes; supports color and size variants, open state via JS or `combobox-open` class
- **`diff`**: New before/after comparison component; uses CSS grid + native `resize: horizontal` for zero-JS drag; `diff-item-1` clips the before content, `diff-item-2` shows the after content with a pill handle via `::after`
- **`radial-progress`**: New circular progress indicator component; set progress via `--progress-value` (0–100), `--size` (default 5rem), `--thickness` (default 10% of size); supports color and size variants (`radial-progress-xs` → `radial-progress-xl`)
- **`swap`**: New CSS-only toggle component for switching between two elements; supports `swap-rotate` and `swap-flip` animation styles, and `swap-active` class for JS-controlled state
- **`countdown`**: New countdown display component using CSS `@property` integer animation and translateY digit-strip technique; set `--countdown-value` on each `<span>` via JS; supports `--digits: 2` and `--digits: 3` CSS variables for multi-digit display via container style queries; sizes (`countdown-xs` → `countdown-xl`)
- **`input`**: Added `input-square` modifier for square/PIN-style inputs — replaces the separate `pin-input` component; pairs with Tailwind `flex gap-*` wrapper; size variants automatically scale via `--input--square-size`
- **`kbd`**: New keyboard key component
- **`loading`**: New loading spinner/indicator component
- **`mask`**: New mask component with shape variants
- **`range`**: New range slider input component
- **`rating`**: New star rating component
- **`select`**: New select dropdown component
- **`skeleton`**: New skeleton loading placeholder component
- **`stat`**: New stat/statistic display component
- **`steps`**: New steps/progress tracker component with `steps-horizontal` and `steps-vertical` layout variants
- **`tabs`**: New tabs navigation component
- **`tag`**: New tag/chip component
- **`textarea`**: New textarea component
- **`timeline`**: New timeline component with `timeline-horizontal` and `timeline-vertical` layout variants, `timeline-snap-start`, and `timeline-snap-end`
- **`toast`**: New toast notification container component with placement variants (`toast-top/middle/bottom`, `toast-start/center/end`)
- **`toggle`**: New toggle switch component
- **`avatar`**: New component with size variants (`avatar-xs` → `avatar-2xl`), shape variants (`avatar-circle`, `avatar-square`, `avatar-rounded`), color variants, ring (`avatar-ring`), status indicators (`avatar-status`, `avatar-online`, `avatar-offline`, `avatar-busy`, `avatar-away`), mask shapes (`avatar-mask-squircle`, `avatar-mask-hexagon`, `avatar-mask-triangle`), and group layout (`avatar-group`)
- **`chat`**: New component with `chat-start` / `chat-end` alignment, `chat-bubble`, `chat-avatar`, `chat-footer`, size variants (`chat-xs` → `chat-xl`), and color variants (`chat-bubble-primary`, `chat-bubble-error`, etc.)
- **`hero`**: New component with `hero-content` for centered content and `hero-overlay` for background image overlays
- **`footer`**: New component with `footer-title`, direction variants (`footer-horizontal`, `footer-vertical`), and `footer-center` for centered layouts
- **`header`**: Added `header-start`, `header-center`, and `header-end` slot utilities for grid-based content placement, plus new state utilities `header-fixed`, `header-shadow`, `header-blur`, `header-transparent`, `header-solid`, and size variants `header-sm` and `header-lg`
- **`plugin`**: Tailwind-compatible plugin that resolves imports, applies prefix, and injects custom themes
- **`cdn`**: Minified CDN build with banner comment via `build:cdn` script
- **`divider`**: Added `divider-dotted` style variant
- **Tests**: Vitest unit test suite — 15/15 passing

### Changed

- **`popover`**: Popovers without an explicit placement class now auto-flip to stay within the viewport using `position-try-fallbacks`; explicit placement classes (e.g. `popover-top-start`) remain strict and never flip
- **`build`**: CDN build now uses `@source inline(...)` to explicitly safelist all registered utilities, ensuring all components are always included in the output regardless of content scanning
- **`btn`**: `btn-square` and `btn-circle` now include `aspect-ratio: 1` for consistent square sizing; `btn-soft` now uses fallback CSS variables for better customization
- **`divider`**: Added `--divider--flex-direction: row` as default in base; removed explicit `height` from base (height is now controlled by content and direction variants)
- **`input`**: Soft variant placeholder opacity increased from 20% to 45% for better readability
- **`popover`**: Simplified to use CSS anchor positioning only; removed arrow/caret element and transition complexity
- **`preflight`**: Color scale generation refactored — all color scales now mix against `--color-on-*` instead of `--palette-shade-*-color` for more accurate theme-aware shades
- **`@plugin` instead of `@import`**: Load Frutjam with `@plugin "frutjam"` instead of `@import "frutjam"`. Works with Vite, PostCSS, Next.js, or any Tailwind-compatible setup
- **Independent prefix**: Frutjam prefix is now configured separately from Tailwind's own prefix — Tailwind's `prefix(tw)` adds `tw:` to Tailwind utilities (e.g., `tw:flex`), while Frutjam's `prefix: "fj"` adds `fj-` to Frutjam components (e.g., `fj-btn`). Both can coexist without conflict
- **`header`**: Layout changed from flexbox to CSS grid (`1fr auto 1fr`) so `header-center` is always truly visually centered regardless of start/end slot widths

### Fixed

- **`join`**: Fixed vertical join items incorrectly losing their inline-start border due to `join-horizontal` rules (applied by default via `@apply`) affecting all join elements; `join-horizontal` border rules are now scoped to non-vertical joins
- **`join`**: Join now works automatically with any element — direction utilities selectively zero only the inner corners adjacent to neighbors, preserving each element's natural `border-radius` without requiring components to opt in
- **`menu`**: Fixed asymmetric padding on `menu-item` in horizontal menus — `padding-inline-end` fallback corrected from `0` to `0.75rem`; internal variable renamed from `--menu-x--padding-inline-end` to `--menu-horizontal--padding-inline-end`
- **`modal`**: Fixed modal going off-screen when combining placement classes (`modal-top`, `modal-start`, etc.) with slide animation classes (`modal-slide-up`, etc.)
- **`popover`**: Fixed popovers appearing over the trigger button instead of beside it (changed to `position: fixed` with CSS anchor positioning)
- **`popover`**: Fixed multiple popover instances on the same page anchoring to the wrong trigger by adding `anchor-scope: all` to the `popover` wrapper
- **`popover`**: Fixed Firefox bug where hover popovers did not appear on the first hover
- **`popover`**: Fixed hover popovers dismissing when the cursor moved from the trigger into the popover content
- **`link`**: Fixed typo in `link-neutral` — `nuetral` corrected to `neutral` in color variable references
- **`alert-pill`**: Fixed shape issue with `alert-pill` not appearing correctly

### Removed

- **`blackberry` theme**: Removed — only `snowberry` (light) and `darkberry` (dark) themes ship by default

## [1.11.0] - 2026-03-10

### Added

- **`alert`**: Added a new `alert` component for displaying contextual feedback messages to users
- **`progress`**: Added a new `progress` component

### Changed

- **`drawer`**: remove custom width logic for drawer and drawer-body

## [1.10.1] - 2026-03-02

### Fixed

- **`join`**: Scoped `join-item` radius to component-level variables to prevent global defaults from overriding `.btn`, `.input`, or `.card` styles

## [1.10.0] - 2026-03-02

### Added

- **`join-item`**: Extended `join-item` utility class to support `input` components. This ensures `border-radius` variables are correctly applied to inputs when grouped
- **`btn`**: add active background color when checkbox is checked

### Changed

- **`badge-circle`**: Removed `width` and `height` to allow flexible sizing
- **`input`**: Changed from `outline` to `border`. This ensures the input and button maintain a perfectly synchronized height and stroke-line when grouped

### Fixed

- **`badge`**: Fix incorrect default padding size in `badge-square` and `badge-circle`
- **`tooltip-body`**: Rename CSS variable to avoid conflict with utility class name

## [1.9.1] - 2026-02-21

### Fixed

- **`btn-circle`**: fixed incorrect variable assignment that caused shape rendering failure

## [1.9.0] - 2026-02-20

### Added

- **`prose-frutjam`**: Introduced `.prose-frutjam`, a new typography utility that bridges `@tailwindcss/typography` with the Frutjam theme
- **`doc`**: Added [Typography Docs](https://frutjam.com/docs/typography) page

### Changed

- **`typography`**: Adjusted line-height: tight (1.15) for heading utility and relaxed (1.6) for para utility

## [1.8.0] - 2026-02-05

### Added

- **`btn`**: Added CSS-based auto color-contrast fallback for buttons using `color-contrast()` to ensure readable text when `--color-on-btn` is not explicitly defined
- **`btn`**: Added user-select: none to the base button to ensure it looks consistent across browsers.
- **`join`**: Added a new join component for grouping other components (e.g., Button, Card).

### Changed

- **`accordion`**: Improved accordion UX by limiting pointer cursor to summary
- **`menu`**: Removed default padding from the menu
- **`menu`**: Added `margin-block-start` to `ul` and `li` elements in the menu
- **`menu`**: Excluded the first `li` child from the added `margin-block-start`
- **`btn`**: Improved button hover and unhover smoothness with refined transition timing
- **`btn`**:Refined hover background behavior to avoid abrupt color changes
- **`btn`**: Changed from outline to border for better visual consistency
- **`cdn`**: refactor: separate responsive and non-responsive utilities

### Fixed

- **`accordion`**: Improved chevron icon alignment to be vertically centered
- **`menu`**: Apply `margin-block-start` only when a popover position is set
- **`btn`**: Better disabled state (50% opacity instead of 20% - more accessible)
- **`table`**: override UA th alignment and use logical start

## [1.7.0] - 2026-01-14

### Added

- **`menu`**: Add `cursor: pointer` to `menu-item`
- **`popover`**: Added new `popover` component with click and hover support

### Changed

- **`core`**: Replace physical CSS properties with logical ones for LTR/RTL
- **`breadcrumb`**: Changed breadcrumb separator icon color to `--color-on-base`

### Fixed

- **`card`**: Remove overflow:hidden to allow content overflow
- **`accordion`**: Prevent chevron from being cut off on small screens or long text
- **`accordion`**: Reduce chevron icon size for better fit
- **`accordion`**: Fixed accordion top margin not applying in the menu

## [1.6.0] - 2026-01-08

### Added

- **`cdn`**: Add breakpoint variants to all CDN classes
- **`badge`**: Added new `badge-pill` utility class

### Changed

- **`menu`**: Set the menu component content color to the base color

### Fixed

- **`accordion`**: Restored padding behavior in the accordion component: Padding is applied when `accordion-flush` is not used, and padding is removed when `accordion-flush` is applied.
- **`menu`**: Add the `menu-disabled` and `menu-active` classes to the safelist
- **`menu`**: Fixed alignment issues in the menu component when using icons with text, ensuring icons and labels appear on the same line
- **`accordion`**: align summary icon and text to start with arrow at end
- **`badge`**: Fixed `badge-circle` utility not rendering as a full circle when applied

## [1.5.0] - 2026-01-06

### Removed

- **`menu`**: Removed submenu utility to simplify the menu component implementation

### Fixed

- **`accordion`**: Adjusted accordion padding to ensure better alignment with other components, such as the menu, without disrupting their layout
- **`menu`**: Improved component alignment for better consistency

## [1.4.0] - 2026-01-06

### Added

- **`menu`**: Introduced `menu-item` class for the `menu` component to improve menu structure and styling

### Changed

- **`accordion`**: Implement accordion chevron icon using pure CSS to ensure theme color consistency

### Removed

- **`sidebar`**: Remove defualt padding in `sidebar` component

## [1.3.0] - 2026-01-05

### Added

- **`accordion`**: Introduced `accordion-body` utility to wrap content and improve separation within accordion sections
- **`menu`**: New `submenu` class for the `menu` component to support nested menu items

### Changed

- **`accordion`**: `accordion-flush` utility: removed padding and set font-weight to normal
- **`accordion`**: Removed the default background color from `accordion`.
- **`accordion`**: Updated the `details` element to span the full width of its container.
- **`accordion`**: Improved padding to better align with other components such as `menu`.
- **`menu`**: Overall structure and styling of the `menu` component for better usability and visual consistency.
- **`menu`**: Alignment and integration of `menu` component with `accordion` component for seamless collapse/expand behavior within nested menus.

### Fixed

- **`accordion`**: Accordion border and padding for nested accordions:
  - Apply border only to top-level accordion (prevent border on nested accordions)
  - Add padding to first-level accordion-body and summary only, removing it from nested items
  - Ensure nested details and summaries do not inherit styles from parent accordion
- **`accordion`**: Removed top padding from the first `<summary>` tag in the `accordion-flush` to improve visual consistency

## [1.2.0] - 2025-12-30

### Added

- **`menu`**: Added `Menu` component with vertical/horizontal layouts and nested submenu support
- **`tooltip`**: Added `Tooltip` component
- **`accordion`**: Add `.accordion-flush` utility to `accordion` component to remove default border

## [1.1.0] - 2025-12-18

### Added

- **`table`**: `table-hover` utility to highlight rows on mouseover.
- **`table`**: `table-zebra` as a shorthand for standard row-based striping.
- **`table`**: `table-zebra-rows` and `table-zebra-cols` for explicit horizontal or vertical striping.
- **`table`**: `table-pin-rows` and `table-pin-cols` for sticky headers and fixed-position columns.
- **`table`**: `table-{xs|sm|md|lg|xl}` for controlling cell padding and font sizes.
- **`radio`**: Added a new Radio component for user selection

### Fixed

- **`header`**: Fix header width to span full screen
- **`card`**: Fixes the card-body text color issue when the `card-{color}` theme utility class is applied, ensuring the text color matches the card theme.
- **`checkbox`**: Corrected variable assignment for `checkbox-rounded`, `checkbox-circle`, and `checkbox-square` utilities, ensuring proper border radius is applied.

## [1.0.0] - 2025-12-03

### Added

- **Prebuilt UI Components** — Ready-to-use components like Buttons, Modals, Accordions, Badges, Cards, Breadcrumbs, Checkboxes, and more.
- **Flexible Theme System** — Multiple built-in themes (Light, Dark, etc.) plus full support for creating custom themes via CSS variables.
- **RTL & Responsive Support** — Out-of-the-box support for right-to-left languages and mobile-first responsive layouts.
- **Accessibility-First Design** — Components built with semantic HTML and accessibility best practices for inclusive, WCAG-friendly interfaces.
- **SEO-Friendly & Standards-Compliant** — Clean, valid HTML and semantic markup for better SEO and W3C compatibility.
- **Tailwind CSS Integration** — Seamless integration with Tailwind CSS with minimal setup.
- **Markdown Editor Plugin** — Built-in plugin support, including a theme-aware Markdown editor for rich text content.
- **Developer-Friendly & Extensible** — Minimal setup, flexible customization, and full control without relying on heavy JavaScript.

## [2.7.1-beta.1] - 2025-10-19

- Fixes drawer width when no placement utility is assigned with the drawer component

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

[Unreleased]: https://github.com/nezanuha/frutjam/compare/v1.11.0...HEAD
[1.11.0]: https://github.com/nezanuha/frutjam/compare/v1.10.1...v1.11.0
[1.10.1]: https://github.com/nezanuha/frutjam/compare/v1.10.0...v1.10.1
[1.10.0]: https://github.com/nezanuha/frutjam/compare/v1.9.1...v1.10.0
[1.9.1]: https://github.com/nezanuha/frutjam/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/nezanuha/frutjam/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/nezanuha/frutjam/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/nezanuha/frutjam/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/nezanuha/frutjam/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/nezanuha/frutjam/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/nezanuha/frutjam/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/nezanuha/frutjam/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/nezanuha/frutjam/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/nezanuha/frutjam/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nezanuha/frutjam/compare/v2.7.1-beta.1...v1.0.0
[2.7.1-beta.1]: https://github.com/nezanuha/frutjam/compare/v2.7.1-beta.0...v2.7.1-beta.1
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