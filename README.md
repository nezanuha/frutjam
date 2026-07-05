[![npm installs][npm_installs]](https://www.npmjs.com/package/frutjam)
[![Jsdelivr hits][jsdelivr]](https://cdn.jsdelivr.net/npm/frutjam)
[![Latest Release](https://img.shields.io/npm/v/frutjam.svg)](https://github.com/nezanuha/frutjam/releases)
[![License](https://img.shields.io/npm/l/frutjam.svg)](https://github.com/nezanuha/frutjam/blob/master/LICENSE)
[![Secured](https://img.shields.io/badge/Security-Passed-green)](https://snyk.io/test/github/nezanuha/frutjam)

---

# Frutjam — Free CSS-Only Tailwind CSS UI Component Library

**[Frutjam](https://frutjam.com)** is a free, open-source Tailwind CSS component library with 65+ production-ready UI components — **no JavaScript required**. Pure CSS, fully accessible, copy-paste friendly. Works with any stack: HTML, React, Vue, HTMX, Django, Laravel, Next.js, and more.

---

## 🔗 Essential Links

| Resource | Link |
|----------|------|
| Website | [frutjam.com](https://frutjam.com) |
| Documentation | [frutjam.com/docs](https://frutjam.com/docs) |
| All Components | [frutjam.com/components](https://frutjam.com/components) |
| UI Blocks | [frutjam.com/blocks](https://frutjam.com/blocks) |
| Themes | [frutjam.com/themes](https://frutjam.com/themes) |
| Changelog | [frutjam.com/blog](https://frutjam.com/blog) |
| GitHub Repository | [nezanuha/frutjam](https://github.com/nezanuha/frutjam) |
| npm Package | [npmjs.com/package/frutjam](https://www.npmjs.com/package/frutjam) |
| Installation Guide | [frutjam.com/docs/installation](https://frutjam.com/docs/installation) |

---

## Why Frutjam?

- **Zero JavaScript** — every component works with pure CSS. No `addEventListener`, no hydration, no runtime.
- **65+ components** — buttons, modals, tabs, drawers, tooltips, carousels, and more — all ready to copy-paste.
- **Accessible by default** — WCAG AA compliant. Keyboard navigable. Screen-reader friendly.
- **Framework-agnostic** — drop it into React, Next.js, Vue, Svelte, HTMX, Django, Laravel, or plain HTML.
- **Tailwind CSS native** — installed as a Tailwind plugin. Your existing Tailwind utilities work alongside it with zero conflicts.
- **Themeable** — swap themes with a single `data-theme` attribute. Build your own in CSS.
- **Lightweight** — only the components you use are included. No bloat.

---

## Installation

```bash
npm install frutjam
```

In your main stylesheet:

```css
@import "tailwindcss";
@plugin "frutjam";
```

That's it. All 50+ components are available immediately.

---

## Quick Start

```html
<!-- Button -->
<button class="btn btn-primary">Get Started</button>

<!-- Badge -->
<span class="badge badge-success">New</span>

<!-- Card -->
<div class="card">
  <div class="card-body">
    <h2 class="card-title">Hello Frutjam</h2>
    <p>CSS-only Tailwind UI components.</p>
  </div>
</div>

<!-- Modal (CSS-only, no JavaScript) -->
<label for="my-modal" class="btn">Open Modal</label>
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3>Pure CSS modal — no JavaScript</h3>
    <label for="my-modal" class="btn mt-4">Close</label>
  </div>
</div>
```

---

## UI Components

65+ free, production-ready CSS-only Tailwind CSS components — categorized for easy browsing.

All components are fully documented with live previews, copy-paste code, and accessibility notes.

### Inputs & Forms

[Button](https://frutjam.com/components/button) · [Checkbox](https://frutjam.com/components/checkbox) · [Radio](https://frutjam.com/components/radio) · [Toggle](https://frutjam.com/components/toggle) · [Input](https://frutjam.com/components/input) · [Textarea](https://frutjam.com/components/textarea) · [Select](https://frutjam.com/components/select) · [Range](https://frutjam.com/components/range) · [Rating](https://frutjam.com/components/rating) · [Combobox](https://frutjam.com/components/combobox)

### Layout & Navigation

[Navbar](https://frutjam.com/components/navbar) · [Sidebar](https://frutjam.com/components/sidebar) · [Drawer](https://frutjam.com/components/drawer) · [Menu](https://frutjam.com/components/menu) · [Breadcrumb](https://frutjam.com/components/breadcrumb) · [Tabs](https://frutjam.com/components/tabs) · [Steps](https://frutjam.com/components/steps) · [Footer](https://frutjam.com/components/footer) · [Header](https://frutjam.com/components/header) · [Join](https://frutjam.com/components/join)

### Feedback & Overlay

[Modal](https://frutjam.com/components/modal) · [Toast](https://frutjam.com/components/toast) · [Alert](https://frutjam.com/components/alert) · [Tooltip](https://frutjam.com/components/tooltip) · [Popover](https://frutjam.com/components/popover) · [Loading](https://frutjam.com/components/loading) · [Skeleton](https://frutjam.com/components/skeleton) · [Progress](https://frutjam.com/components/progress) · [Radial Progress](https://frutjam.com/components/radial-progress)

### Data Display

[Card](https://frutjam.com/components/card) · [Table](https://frutjam.com/components/table) · [Stat](https://frutjam.com/components/stat) · [Badge](https://frutjam.com/components/badge) · [Tag](https://frutjam.com/components/tag) · [Avatar](https://frutjam.com/components/avatar) · [Indicator](https://frutjam.com/components/indicator) · [Diff](https://frutjam.com/components/diff) · [Timeline](https://frutjam.com/components/timeline) · [Chat](https://frutjam.com/components/chat)

### Typography & Decoration

[Hero](https://frutjam.com/components/hero) · [Divider](https://frutjam.com/components/divider) · [Kbd](https://frutjam.com/components/kbd) · [Link](https://frutjam.com/components/link) · [Mask](https://frutjam.com/components/mask) · [Swap](https://frutjam.com/components/swap) · [Countdown](https://frutjam.com/components/countdown) · [Marquee](https://frutjam.com/components/marquee) · [Carousel](https://frutjam.com/components/carousel) · [Accordion](https://frutjam.com/components/accordion) · [Collapsible](https://frutjam.com/components/collapsible) · [Surface](https://frutjam.com/components/surface)

**[Browse the full interactive component library →](https://frutjam.com/components)**

---

## With Prefix

**Frutjam prefix** — renames all Frutjam class names:

```css
@import "tailwindcss";
@plugin "frutjam" {
  prefix: fj;
}
```

```html
<button class="fj-btn fj-btn-primary">Launch App</button>
```

**Tailwind prefix** — Tailwind's `prefix()` acts as a variant across all utilities:

```css
@import "tailwindcss" prefix(tw);
@plugin "frutjam";
```

```html
<button class="tw:btn tw:btn-primary">Launch App</button>
```

**Both prefixes** — Frutjam renames its classes, Tailwind variant prefix on top:

```css
@import "tailwindcss" prefix(tw);
@plugin "frutjam" {
  prefix: fj;
}
```

```html
<button class="tw:fj-btn tw:fj-btn-primary">Launch App</button>
```

---

## Plugin Options

All options can be set in CSS via `@plugin "frutjam" { ... }` or in `postcss.config.js`:

| Option | Default | Description |
|--------|---------|-------------|
| `prefix` | `""` | Prefix all Frutjam class names (e.g. `fj` → `fj-btn`) |
| `reset` | `true` | Include browser reset and element defaults |
| `root` | `":root"` | Remap CSS variable declarations to a custom selector (e.g. `":host"`) |
| `logs` | `true` | Show build-time console output |
| `include` | `[]` | Include only specific components or utilities |
| `exclude` | `[]` | Exclude specific components or utilities |

---

## Themes

Frutjam ships with a built-in default theme and supports unlimited custom themes. Apply any theme with a `data-theme` attribute:

```html
<body data-theme="dark">...</body>
<div data-theme="forest">...</div>
```

Define your own theme in CSS using `@layer theme`:

```css
@layer theme {
  [data-theme="ocean"] {
    --scheme-color: dark;
    --color-primary: oklch(60% 0.2 220);
    --color-on-primary: oklch(98% 0.01 220);
    --color-base: oklch(15% 0.02 220);
    --color-on-base: oklch(92% 0.01 220);
  }
}
```

**[Explore all themes →](https://frutjam.com/themes)**

---

## CDN (no build step)

Use Frutjam directly from a CDN — no Node.js, no build tools required:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frutjam/dist/frutjam.min.css" />
```

---

## Framework Support

Frutjam works anywhere Tailwind CSS runs — it has no JavaScript runtime dependency.

| Framework | Supported |
|-----------|-----------|
| HTML / Static | ✅ |
| React / Next.js | ✅ |
| Vue / Nuxt | ✅ |
| Svelte / SvelteKit | ✅ |
| HTMX | ✅ |
| Django | ✅ |
| Laravel / Blade | ✅ |
| Astro | ✅ |
| Any other framework | ✅ |

---

## Documentation

Full documentation with live previews, copy-paste code, and API references:

- **[Getting Started](https://frutjam.com/docs/overview)** — installation, setup, configuration
- **[Components](https://frutjam.com/components)** — all 65+ components with live demos
- **[Themes](https://frutjam.com/themes)** — built-in and custom themes
- **[Blocks](https://frutjam.com/blocks)** — prebuilt page sections (hero, header, footer, and more)

---

## Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-component`
3. Commit your changes: `git commit -m 'Add my-component'`
4. Push to the branch: `git push origin feature/my-component`
5. Open a Pull Request

Please read the [contributing guidelines](.github/CONTRIBUTING.md) before submitting.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## ⭐ Star this repo

If Frutjam saves you time, a star helps others find it.

[![GitHub stars](https://img.shields.io/github/stars/nezanuha/frutjam.svg?style=social&label=Star&maxAge=2592000)](https://github.com/nezanuha/frutjam/stargazers)

---

[jsdelivr]: https://badgen.net/jsdelivr/hits/npm/frutjam
[npm_installs]: https://badgen.net/npm/dt/frutjam
