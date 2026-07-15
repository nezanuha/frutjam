[![npm installs][npm_installs]](https://www.npmjs.com/package/frutjam)
[![Jsdelivr hits][jsdelivr]](https://cdn.jsdelivr.net/npm/frutjam)
[![Latest Release](https://img.shields.io/npm/v/frutjam.svg)](https://github.com/nezanuha/frutjam/releases)
[![License](https://img.shields.io/npm/l/frutjam.svg)](https://github.com/nezanuha/frutjam/blob/master/LICENSE)
[![Secured](https://img.shields.io/badge/Security-Passed-green)](https://snyk.io/test/github/nezanuha/frutjam)

---

# Frutjam — CSS-Only Tailwind CSS UI Component Library

**Frutjam** is a free, open-source Tailwind CSS v4 component library. 65+ production-ready UI components with **zero JavaScript**, guaranteed **WCAG AA accessibility**, and a free **MCP server for AI editors** (Cherry). Works with any framework: React, Vue, HTMX, Django, Laravel, plain HTML.

🌐 **[frutjam.com](https://frutjam.com)** · 📦 **[npm](https://www.npmjs.com/package/frutjam)** · 🍒 **[Cherry MCP](https://frutjam.com/products/cherry)**

---

## What is Frutjam?

Frutjam is a **CSS-only Tailwind CSS component library** built for Tailwind CSS v4. You install it as a Tailwind plugin — one line in your CSS — and instantly get 65+ accessible, copy-paste UI components: buttons, modals, drawers, tabs, toasts, carousels, tables, forms, and more.

Every component works with pure HTML and CSS. No JavaScript framework required. No build pipeline beyond Tailwind itself. Drop it into any stack and start building.

---

## Quick Install

```bash
npm install -D frutjam
```

```css
@import "tailwindcss";
@plugin "frutjam";
```

**That's it.** All 65+ components are available immediately. No imports, no config, no extra stylesheets.

---

## Why Frutjam?

| | Frutjam | DaisyUI | Shadcn UI | Flowbite |
|---|---|---|---|---|
| Zero JavaScript | ✅ | ✅ | ❌ React required | ⚠️ Some JS |
| Tailwind v4 native | ✅ | ⚠️ v3 + v4 | ⚠️ | ❌ |
| WCAG AA guaranteed | ✅ Every component | ⚠️ | ⚠️ | ⚠️ |
| OKLCH color system | ✅ | ❌ | ❌ | ❌ |
| MCP server for AI editors | ✅ Cherry (free tier) | ✅ Blueprint (paid only) | ❌ | ❌ |
| Framework-agnostic | ✅ | ✅ | ❌ React only | ⚠️ |
| Copy-paste friendly | ✅ | ✅ | ✅ | ✅ |
| MIT license | ✅ | ✅ | ✅ | ✅ |

**The short version:** Frutjam is the only Tailwind v4-native component library with guaranteed WCAG AA accessibility, an OKLCH color system, and a free MCP server for AI-assisted development.

---

## Key Features

- **Zero JavaScript** — every component works with pure CSS and semantic HTML. Native `<dialog>` for modals, `<details>` for accordions, CSS `:has()` for interactive states. No `addEventListener`, no hydration, no runtime.
- **65+ components** — buttons, modals, tabs, drawers, tooltips, carousels, cards, alerts, toasts, tables, forms, and more. All production-ready.
- **WCAG AA by default** — every color pair (`--color-primary` / `--color-on-primary`) is hand-tuned in OKLCH to meet WCAG AA contrast requirements. Semantic HTML throughout.
- **Tailwind v4 native** — built as a Tailwind v4 plugin using `@plugin`. No legacy `tailwind.config.js`. OKLCH design tokens via CSS custom properties.
- **Framework-agnostic** — works with React, Next.js, Vue, Nuxt, Svelte, HTMX, Django, Laravel Blade, Astro, Rails, plain HTML — anything that outputs HTML.
- **Themeable** — swap themes with `data-theme="dark"`. Build custom themes in CSS with OKLCH tokens. Supports light, dark, and system preference automatically.
- **Treeshaken** — only the components you use are included. Tailwind's engine removes unused styles at build time.
- **CDN-ready** — no build step needed. Import directly from jsDelivr.

---

## 🍒 Cherry MCP — AI Editor Integration

Cherry is Frutjam's **free MCP server** that gives AI coding assistants accurate, real-time access to Frutjam component docs.

Without Cherry, AI assistants (Claude Code, Cursor, GitHub Copilot) hallucinate Tailwind CSS class names — inventing classes that don't exist. Cherry solves this by feeding your AI editor the exact Frutjam specs at the moment it needs them.

**Works with:** Claude Code · Cursor · VS Code · Windsurf · Zed · Cline · any MCP-compatible editor

```json
{
  "mcpServers": {
    "frutjam": {
      "command": "npx",
      "args": ["-y", "frutjam-cherry"]
    }
  }
}
```

[**Get Cherry MCP →**](https://frutjam.com/products/cherry)

---

## Components

65+ free, production-ready CSS-only Tailwind CSS components:

### Inputs & Forms
- [Button](https://frutjam.com/components/button)
- [Checkbox](https://frutjam.com/components/checkbox)
- [Radio](https://frutjam.com/components/radio)
- [Toggle](https://frutjam.com/components/toggle)
- [Input](https://frutjam.com/components/input)
- [Textarea](https://frutjam.com/components/textarea)
- [Select](https://frutjam.com/components/select)
- [Range](https://frutjam.com/components/range)
- [Rating](https://frutjam.com/components/rating)
- [Combobox](https://frutjam.com/components/combobox)

### Layout & Navigation
- [Navbar](https://frutjam.com/components/navbar)
- [Sidebar](https://frutjam.com/components/sidebar)
- [Drawer](https://frutjam.com/components/drawer)
- [Menu](https://frutjam.com/components/menu)
- [Breadcrumb](https://frutjam.com/components/breadcrumb)
- [Tabs](https://frutjam.com/components/tabs)
- [Steps](https://frutjam.com/components/steps)
- [Footer](https://frutjam.com/components/footer)
- [Header](https://frutjam.com/components/header)
- [Join](https://frutjam.com/components/join)
- [Pagination](https://frutjam.com/components/pagination)

### Feedback & Overlay
- [Modal](https://frutjam.com/components/modal)
- [Toast](https://frutjam.com/components/toast)
- [Alert](https://frutjam.com/components/alert)
- [Tooltip](https://frutjam.com/components/tooltip)
- [Popover](https://frutjam.com/components/popover)
- [Loading](https://frutjam.com/components/loading)
- [Skeleton](https://frutjam.com/components/skeleton)
- [Progress](https://frutjam.com/components/progress)
- [Radial Progress](https://frutjam.com/components/radial-progress)

### Data Display
- [Card](https://frutjam.com/components/card)
- [Table](https://frutjam.com/components/table)
- [Stat](https://frutjam.com/components/stat)
- [Badge](https://frutjam.com/components/badge)
- [Tag](https://frutjam.com/components/tag)
- [Avatar](https://frutjam.com/components/avatar)
- [Indicator](https://frutjam.com/components/indicator)
- [Diff](https://frutjam.com/components/diff)
- [Timeline](https://frutjam.com/components/timeline)
- [Chat](https://frutjam.com/components/chat)

### Typography & Decoration
- [Hero](https://frutjam.com/components/hero)
- [Divider](https://frutjam.com/components/divider)
- [Kbd](https://frutjam.com/components/kbd)
- [Link](https://frutjam.com/components/link)
- [Mask](https://frutjam.com/components/mask)
- [Swap](https://frutjam.com/components/swap)
- [Countdown](https://frutjam.com/components/countdown)
- [Marquee](https://frutjam.com/components/marquee)
- [Carousel](https://frutjam.com/components/carousel)
- [Accordion](https://frutjam.com/components/accordion)
- [Collapsible](https://frutjam.com/components/collapsible)
- [Surface](https://frutjam.com/components/surface)

[**Browse all components with live previews →**](https://frutjam.com/components)

---

## Usage Examples

```html
<!-- Primary button -->
<button class="btn btn-primary">Get Started</button>

<!-- Outline button with badge -->
<button class="btn btn-outline">
  Notifications
  <span class="badge badge-primary">3</span>
</button>

<!-- CSS-only modal — no JavaScript -->
<button popovertarget="my-modal" class="btn btn-primary">Open Modal</button>
<dialog id="my-modal" popover class="modal">
  <div class="modal-content">
    <h3 class="heading-lg">Pure CSS modal</h3>
    <p class="para">Zero JavaScript. Native browser popover API.</p>
    <button popovertarget="my-modal" class="btn mt-4">Close</button>
  </div>
</dialog>

<!-- Alert -->
<div class="alert alert-success">
  <p>Your changes have been saved.</p>
</div>

<!-- Card -->
<div class="card">
  <div class="card-content">
    <h2 class="heading-lg">Card title</h2>
    <p class="para">Card content goes here.</p>
  </div>
</div>

<!-- Input -->
<div class="flex flex-col gap-2">
  <label class="text-sm font-medium">Email</label>
  <input type="email" class="input" placeholder="you@example.com">
</div>

<!-- Badge variants -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success badge-soft">Success</span>
<span class="badge badge-error badge-outline">Error</span>
```

---

## Accessibility

Frutjam is designed for WCAG AA compliance from the ground up:

- **Color contrast** — every color token pair is hand-tuned in OKLCH to exceed WCAG AA 4.5:1 contrast ratio for text
- **Semantic HTML** — native `<dialog>` for modals, `<details>` for accordions, `<nav>` for navigation, correct heading hierarchy
- **Keyboard navigation** — all interactive components are fully keyboard accessible
- **Screen reader support** — ARIA attributes included where native semantics are insufficient
- **Focus management** — visible focus rings on all interactive elements, respects `prefers-reduced-motion`

---

## Themes

```html
<html data-theme="darkberry">
```

```css
/* Define your own theme */
@layer theme {
  [data-theme="ocean"] {
    --color-primary: oklch(60% 0.2 220);
    --color-on-primary: oklch(98% 0.01 220);
    --color-base: oklch(15% 0.02 220);
    --color-on-base: oklch(92% 0.01 220);
  }
}
```

[**Explore themes →**](https://frutjam.com/themes)

---

## Plugin Options

| Option | Default | Description |
|--------|---------|-------------|
| `prefix` | `""` | Prefix all Frutjam class names (e.g. `fj` → `fj-btn`) |
| `reset` | `true` | Include browser reset and element defaults |
| `root` | `":root"` | Remap CSS variable declarations to a custom selector |
| `logs` | `true` | Show build-time console output |
| `include` | `[]` | Include only specific components |
| `exclude` | `[]` | Exclude specific components |

---

## CDN (No Build Step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frutjam/dist/frutjam.min.css" />
```

---

## Framework Support

| Framework | Status |
|-----------|--------|
| HTML / Static sites | ✅ |
| React / Next.js | ✅ |
| Vue / Nuxt | ✅ |
| Svelte / SvelteKit | ✅ |
| HTMX | ✅ |
| Django | ✅ |
| Laravel / Blade | ✅ |
| Astro | ✅ |
| Ruby on Rails | ✅ |
| Any HTML output | ✅ |

---

## Documentation

- [Getting Started](https://frutjam.com/docs/overview)
- [Installation Guide](https://frutjam.com/docs/installation)
- [Configuration](https://frutjam.com/docs/configuration)
- [Theming](https://frutjam.com/docs/themes)
- [Colors](https://frutjam.com/docs/colors)
- [All Components](https://frutjam.com/components)
- [UI Blocks](https://frutjam.com/blocks)
- [Cherry MCP](https://frutjam.com/products/cherry)

---

## Community

- [Discord](https://discord.gg/FvjytjQSSZ)
- [X / Twitter](https://x.com/FrutjamUI)
- [Write for Us](https://frutjam.com/write-for-us)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-component`
3. Commit your changes: `git commit -m 'Add my-component'`
4. Push: `git push origin feature/my-component`
5. Open a Pull Request

---

## License

MIT — free for personal and commercial use. See [LICENSE](LICENSE).

---

## ⭐ Star this repo

If Frutjam saves you time, a star helps others find it.

[![GitHub stars](https://img.shields.io/github/stars/nezanuha/frutjam.svg?style=social&label=Star&maxAge=2592000)](https://github.com/nezanuha/frutjam)

---

[jsdelivr]: https://badgen.net/jsdelivr/hits/npm/frutjam
[npm_installs]: https://badgen.net/npm/dt/frutjam
