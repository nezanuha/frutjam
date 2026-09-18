---
title: "The Best DaisyUI Alternative: CSS-Only Tailwind Components Without JavaScript"
description: "Why developers are switching from DaisyUI to Frutjam — a CSS-only Tailwind CSS component library that passes WCAG AA by default and requires zero JavaScript."
metaTitle: "Best DaisyUI Alternative: Zero JavaScript, Tailwind v4 | Frutjam"
metaDescription: "CSS-only DaisyUI alternative built for Tailwind CSS v4. Zero JavaScript, WCAG AA contrast on every theme. Works with Django, HTMX, and Laravel. Free."
image: "https://cdn.frutjam.com/media/blog/posts/daisyui-css-only-alternative-tailwind-components.jpg"
imageAlt: "Clay-style still life of a jar of fruit jam with raspberries beside a plain daisy flower"
createdAt: "2026-07-05T06:54:27.455443+00:00"
updatedAt: "2026-07-17T11:49:18.610629+00:00"
---

Most developers who discover DaisyUI love the idea: semantic component classes on top of Tailwind CSS, a broad component library, and an active ecosystem. It remains the most-installed Tailwind component library on npm for good reason. But when you dig into real projects — WCAG audits, multilingual apps, or fine-grained UI control — specific gaps become hard to ignore.

**Frutjam** is a Tailwind CSS component library built around accessibility, performance, and developer precision. 65+ CSS-only components, WCAG AA/AAA contrast on every theme, PageSpeed 100/100, zero layout shift, and a modal and popover system that goes deeper than any comparable library. Optimized for Tailwind v4.

---

## DaisyUI v5: What Changed, What Didn't

DaisyUI v5 is a meaningful upgrade that corrects many of the criticisms aimed at earlier versions. Interactive components no longer require a separate JavaScript plugin:

- **Modal**: native `<dialog>` + `showModal()` or the Popover API — no JS bundle
- **Drawer**: checkbox toggle + CSS — zero JavaScript
- **Dropdown**: native Popover API, `<details>`, or focus-based CSS — zero JavaScript
- **Accordion**: radio inputs or `<details>` / `<summary>` — zero JavaScript

If you have read comparisons claiming DaisyUI v5 requires a JavaScript plugin for interactive components, those comparisons describe DaisyUI v4. Version 5 is largely CSS-based.

What DaisyUI v5 still does not address: WCAG contrast guarantees across its 25+ themes, depth of the modal positioning system, and the absence of a combobox component.

---

## Where Frutjam Is a Better Fit

### 1. WCAG AA/AAA Contrast on Every Theme

Frutjam ships a Berry theming system — six named themes built on OKLCH color values, each hand-tuned to pass WCAG AA and AAA contrast requirements:

| Theme | Mode |
| :--- | :--- |
| Snowberry | Light (default) |
| Darkberry | Dark |
| Blueberry | Light (blue accent) |
| Strawberry | Light (red accent) |
| Grapeberry | Light (purple accent) |
| Peachberry | Light (warm accent) |

Apply a theme with one HTML attribute:

```html
<html data-theme="darkberry">
```

Themes cascade via CSS variables and can be nested — a sidebar can run a dark theme while the rest of the page stays light:

```html
<html data-theme="snowberry">
  <aside data-theme="darkberry">
    <!-- dark sidebar -->
  </aside>
</html>
```

DaisyUI ships 25+ themes. Frutjam ships fewer, but every color pair in every theme — text on background, label on input, badge on card — passes WCAG contrast checks without configuration. No contrast surprises at audit time.

### 2. Modal System: 9 Positions, 4 Animations, LTR/RTL Aware

Both Frutjam and DaisyUI use the native `<dialog>` element with `showModal()`. Where they diverge is what the library provides around it.

**DaisyUI** offers three vertical positions (`modal-top`, `modal-middle`, `modal-bottom`) and no entrance animations.

**Frutjam** provides a full placement and animation system:

| Axis | Classes |
| :--- | :--- |
| Vertical | `modal-top`, `modal-middle`, `modal-bottom` |
| Horizontal | `modal-start`, `modal-center`, `modal-end` |
| Animations | `modal-slide-up`, `modal-slide-down`, `modal-slide-start`, `modal-slide-end` |
| LTR / RTL | `ltr:modal-end`, `rtl:modal-start` |
| Responsive | `modal-top lg:modal-middle` |

Nine placement combinations. Four slide animations. Fully responsive via Tailwind breakpoint prefixes. LTR/RTL aware for multilingual apps.

A notification toast snapping to the top-right:

```html
<dialog class="modal modal-end modal-top modal-slide-end" id="notificationModal">
  <div class="modal-content">
    <p class="para">Your changes were saved.</p>
    <button type="button" class="btn btn-xs" onclick="notificationModal.close()">Dismiss</button>
  </div>
</dialog>
<button type="button" class="btn" onclick="notificationModal.showModal()">Show</button>
```

A sheet that slides up from the bottom on mobile, centered on desktop:

```html
<dialog class="modal modal-center modal-bottom modal-slide-up lg:modal-center lg:modal-middle" id="sheetModal">
  <div class="modal-content">
    <p class="para">Responsive sheet</p>
  </div>
  <button type="button" class="modal-backdrop" onclick="sheetModal.close()">Close</button>
</dialog>
```

### 3. Popover: 12 Positions, Click and Hover

Frutjam's popover uses the native Popover API — zero JavaScript for click-triggered dropdowns. Twelve position classes cover every anchor alignment:

```
popover-top-start    popover-top-center    popover-top-end
popover-bottom-start popover-bottom-center popover-bottom-end
popover-start-top    popover-start-center  popover-start-bottom
popover-end-top      popover-end-center    popover-end-bottom
```

**Click trigger** (native Popover API, zero JS):

```html
<div class="popover popover-bottom-start">
  <button popovertarget="userMenu" type="button" class="popover-toggle btn">Account</button>
  <div tabindex="0" class="popover-content" popover id="userMenu">
    <ul class="menu">
      <li><a class="menu-item">Profile</a></li>
      <li><a class="menu-item">Settings</a></li>
      <li><a class="menu-item">Sign out</a></li>
    </ul>
  </div>
</div>
```

**Hover trigger** (add `popover-hover`, remove `popovertarget` and `popover` attributes):

```html
<div class="popover popover-hover popover-bottom-start">
  <button type="button" class="popover-toggle btn">Hover me</button>
  <div class="popover-content">
    <ul class="menu">
      <li><a class="menu-item">About Us</a></li>
      <li><a class="menu-item">Contact</a></li>
    </ul>
  </div>
</div>
```

### 4. Drawer: 4 Positions Built on `<dialog>`

Frutjam's drawer is built on the native `<dialog>` element using the non-modal `.show()` method — so the rest of the page stays interactive while the drawer is open. Four positions ship out of the box:

```html
<!-- Slide from left -->
<dialog class="drawer drawer-start" id="sideNav">
  <div class="drawer-content w-64 p-4">
    <ul class="menu">
      <li><a class="menu-item">Dashboard</a></li>
      <li><a class="menu-item">Settings</a></li>
    </ul>
  </div>
  <button type="button" class="drawer-backdrop" onclick="sideNav.close()">Close</button>
</dialog>
<button type="button" class="btn" onclick="sideNav.show()">Open Menu</button>
```

Open with `onclick="id.show()"`, close with `onclick="id.close()"` — one line of inline JS per trigger, no library, no initialization lifecycle. For programmatic control from anywhere in your code, `createDrawer` from `frutjam/js` handles it.

### 5. Combobox: Built-In Where DaisyUI Has Nothing

The browser has no native combobox element. DaisyUI has no combobox component — if you need searchable select with keyboard navigation, you write it from scratch.

Frutjam ships a complete combobox. CSS-only for open/close, built-in JS helper for filtering and keyboard navigation:

```html
<!-- Opens on focus — zero JavaScript -->
<div class="relative w-64 focus-within:combobox-open">
  <input type="text" class="input w-full" placeholder="Search...">
  <ul class="combobox-list">
    <li class="combobox-item">React</li>
    <li class="combobox-item">Vue</li>
    <li class="combobox-item">Django</li>
    <li class="combobox-item">Laravel</li>
  </ul>
</div>
```

Add live filtering and keyboard navigation (↑ ↓ Enter Escape) with the built-in helper:

```js
import { createCombobox } from 'frutjam/js'
createCombobox(document.querySelector('.my-combobox'))
```

`createCombobox` also wires up all required `aria-*` attributes automatically. You do not write filtering logic, keyboard handlers, or ARIA patterns — the library ships them.

### 6. Tailwind v4 Native

Frutjam is designed around Tailwind v4 — the v4 import system, CSS-first configuration, and OKLCH color tokens. Install it and add two lines:

```bash
npm install frutjam
```

```css
@import "tailwindcss";
@import "frutjam";
```

```html
<html data-theme="snowberry">
```

Every component is available immediately. No script tags, no initialization, no build step beyond Tailwind itself.

---

## Component Coverage Comparison

| Component | Frutjam | DaisyUI v5 |
| :--- | :--- | :--- |
| **Total components** | 53 | 80 |
| **Built-in themes** | 6 named Berry themes | 25+ |
| **WCAG AA/AAA guaranteed** | Yes — all themes | Not guaranteed |
| Button, Badge, Alert | CSS-only | CSS-only |
| Accordion | CSS-only (`<details>` / `<summary>`) | CSS-only (radio / `<details>`) |
| Modal | `<dialog>` + `showModal()` — 9 positions, 4 animations, LTR/RTL | `<dialog>` + `showModal()` or Popover API — 3 positions |
| Drawer | `<dialog>` + `show()` — 4 positions | Checkbox toggle — CSS-only |
| Popover / Dropdown | Native Popover API — 12 positions, click or hover | Native Popover API / `<details>` / focus-based CSS |
| Combobox | CSS-only open/close + `createCombobox()` helper | **No combobox component** |
| RTL support | Yes — `ltr:` / `rtl:` prefixes on modal, drawer | Partial |
| PageSpeed 100/100 | Yes — zero JS overhead, zero layout shift | — |
| Framework-agnostic | Django, HTMX, Laravel, React, Vue, any stack | Django, HTMX, Laravel, React, Vue, any stack |

---

## Side-by-Side: Modal

The same trigger pattern, different positioning depth.

**DaisyUI** — three positions, no animations, closes via form:

```html
<button class="btn" onclick="my_modal.showModal()">Open Modal</button>

<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Confirm action</h3>
    <p>This action cannot be undone.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
```

**Frutjam** — 9 positions, 4 animations, LTR/RTL, closes via `onclick`:

```html
<button class="btn" onclick="myModal.showModal()">Open Modal</button>

<dialog class="modal modal-center modal-middle modal-slide-up" id="myModal">
  <div class="modal-content">
    <h3 class="heading-lg">Confirm action</h3>
    <p class="para">This action cannot be undone.</p>
    <div class="flex gap-2 justify-end mt-4">
      <button class="btn" onclick="myModal.close()">Cancel</button>
      <button class="btn btn-error" onclick="myModal.close()">Delete</button>
    </div>
  </div>
  <button class="modal-backdrop" onclick="myModal.close()">Close</button>
</dialog>
```

Both use `showModal()` — the difference is the placement and animation system. Frutjam's `modal-slide-up` entrance animation is pure CSS. Changing to a top-right notification panel is one class change: `modal-end modal-top modal-slide-end`.

---

## Migration from DaisyUI

Swap the import in your CSS entry point:

```css
/* Before */
@plugin "daisyui";

/* After */
@import "frutjam";
```

Most component class names carry over directly:

| DaisyUI | Frutjam |
| :--- | :--- |
| `btn` | `btn` |
| `badge` | `badge` |
| `card` | `card` |
| `alert` | `alert` |
| `modal` | `modal` |
| `drawer` | `drawer` |
| `navbar` | `navbar` |
| `menu` | `menu` |
| `accordion` | `accordion` |
| `tabs` | `tabs` |

Modals use the same `showModal()` / `close()` pattern. Drawers switch from checkbox toggle to `dialog.show()` / `dialog.close()` — add an `id` attribute and update the trigger `onclick`. The [Frutjam component docs](https://frutjam.com/components) show the exact HTML pattern for each component.

---

## Frutjam Cherry: AI-Assisted Development Without Hallucinations

One practical challenge with AI coding assistants and component libraries is accuracy. When you ask Claude, Cursor, or Copilot to build a UI with Frutjam components, the model may hallucinate class names or generate outdated syntax learned during training.

**Frutjam Cherry** is a free MCP (Model Context Protocol) server that connects your AI assistant directly to Frutjam's live component documentation. Instead of guessing, the AI fetches exact class names, component structures, and working examples — on demand, always in sync with the latest Frutjam version.

Supported editors: Claude Code, Cursor, VS Code, Windsurf, Zed, Cline, and any MCP-compatible environment. Setup takes under a minute.

Cherry ships five built-in AI slash commands:

| Command | What it does |
| :--- | :--- |
| `/figma_to_frutjam` | Converts a Figma design description to Frutjam components |
| `/image_to_frutjam` | Converts a UI screenshot to Frutjam markup |
| `/tailwind_to_frutjam` | Migrates raw Tailwind markup to Frutjam components |
| `/bootstrap_to_frutjam` | Migrates Bootstrap markup to Frutjam components |
| `/generate_theme` | Generates a custom Berry theme from your design tokens |

Cherry is token-efficient — it fetches specs only when needed rather than dumping the full documentation into context. A free tier is available with no account required. Pro and Team tiers unlock unlimited requests, premium blocks, and all slash commands.

DaisyUI has no equivalent MCP integration. If AI-assisted development is part of your workflow, Cherry is a meaningful differentiator.

[Get Frutjam Cherry](https://frutjam.com/products/cherry)

---

## Frequently Asked Questions

**Does Frutjam require any JavaScript?**
No JavaScript required for core components. Accordion, tabs, popover, swap, and carousel are pure CSS. Modal and drawer use one line of inline `onclick` — native browser JS, no library. Combobox ships a `createCombobox()` helper for filtering and keyboard navigation.

**Does DaisyUI v5 require a JavaScript plugin for interactive components?**
No — DaisyUI v5 moved to CSS-based approaches. Drawer uses checkbox toggle, dropdown uses the Popover API, accordion uses `<details>`. Comparisons describing a required JS bundle apply to DaisyUI v4, not v5.

**Will HTMX break Frutjam components?**
No. CSS-only components (accordion, tabs, swap) need no re-initialization. Modal and drawer use inline `onclick="id.showModal()"` and `onclick="id.show()"` — plain HTML attributes that the browser evaluates on every render, including after HTMX swaps.

**Can I use a custom theme?**
Yes. Define CSS variables in a `[data-theme="yourtheme"]` block using OKLCH color values. Apply it with `data-theme="yourtheme"` on any element. Themes can be scoped — a single page can have multiple themes nested in different sections.

**How does Frutjam handle RTL languages?**
RTL is built into the layout system. Use `ltr:modal-end rtl:modal-start` on the modal to position it correctly in both directions. Drawer, popover, and other directional components follow the same `ltr:` / `rtl:` prefix pattern.

---

## The Bottom Line

DaisyUI v5 is a capable, well-maintained library. If you need 80 components and 25+ themes and the community ecosystem matters, it is a strong choice.

Frutjam is the better fit if you need WCAG-compliant themes out of the box, a modal system with 9 placement positions and 4 animations, a popover with 12 positions, a built-in combobox, and a codebase designed for Tailwind v4 from the ground up.

Both are free, MIT licensed, and framework-agnostic. The question is how far the library goes on the details that matter for your project.

[Browse all 65+ Frutjam components](https://frutjam.com/components) and see what the difference looks like in code.

## Components mentioned in this post

- [Button](/components/button)
- [Card](/components/card)
- [Modal](/components/modal)
- [Badge](/components/badge)
- [Navbar](/components/navbar)
- [Alert](/components/alert)
