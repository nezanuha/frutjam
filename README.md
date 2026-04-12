[![npm installs][npm_installs]](https://www.npmjs.com/package/frutjam)
[![Jsdelivr hits][jsdelivr]](https://cdn.jsdelivr.net/npm/frutjam)
[![Latest Release](https://img.shields.io/npm/v/frutjam.svg)](https://github.com/nezanuha/frutjam/releases)
[![License](https://img.shields.io/npm/l/frutjam.svg)](https://github.com/nezanuha/frutjam/blob/master/LICENSE)
[![Secured](https://img.shields.io/badge/Security-Passed-green)](https://snyk.io/test/github/nezanuha/frutjam)

---

# Frutjam: Free & Open-Source Tailwind CSS UI Library

[Frutjam](https://frutjam.com) is a lightweight, modern UI library built for speed. It provides prebuilt Tailwind CSS components that are completely free to use — pure CSS, no JavaScript required. Works with Vite, PostCSS, Next.js, or any framework.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/nezanuha/frutjam.svg)](https://github.com/nezanuha/frutjam/stargazers)

## Pure CSS, no JavaScript needed. Framework-agnostic and fully compatible everywhere.

**Frutjam** is a UI component library built on top of **Tailwind CSS**, designed to help developers build accessible, SEO-friendly, and W3C-compliant interfaces—fast. With a wide selection of prebuilt components and themes, Frutjam makes it easy to hit the ground running or fully customize your design system.

---

## Key Features

* 🧱 **Prebuilt UI Components** — Plug-and-play components to save time
* 🎨 **Customizable Themes** — Built-in themes plus custom theme injection
* 🏷️ **Independent Prefix Support** — Scope Frutjam classes behind their own prefix (e.g. `fj-btn`), separate from Tailwind’s prefix
* ♿ **Accessibility-First** — Follows accessibility best practices
* 🔍 **SEO-Friendly** — Semantic markup optimized for search engines
* ✅ **W3C Standards** — Clean, valid HTML structure
* ⚙️ **Built for Tailwind CSS** — Seamless integration with your Tailwind setup

---

## Installation & Usage

```bash
npm install frutjam
```

In your main stylesheet:

```css
@import "tailwindcss";
@plugin "frutjam";
```

## Basic Example

```html
<button class="btn btn-primary">
  Launch App
</button>
```

## With Prefix

Configure the prefix directly in your CSS file — no `postcss.config.js` changes needed:

```css
@import "tailwindcss";
@plugin "frutjam" {
  prefix: fj;
}
```

Or via `postcss.config.js` if you prefer:

```js
module.exports = {
  plugins: {
    "frutjam": { prefix: "fj" },
    "@tailwindcss/postcss": {}
  }
}
```

```html
<button class="fj-btn fj-btn-primary">
  Launch App
</button>
```

## Plugin Options

All options can be set in CSS via `@plugin "frutjam" { ... }` or in `postcss.config.js`:

| Option | Default | Description |
|--------|---------|-------------|
| `prefix` | `""` | Prefix all Frutjam class names (e.g. `fj` → `fj-btn`) |
| `reset` | `true` | Include browser reset and element defaults |
| `root` | `":root"` | Remap CSS var declarations to a custom selector (e.g. `":host"`) |
| `logs` | `true` | Show build-time console output |
| `include` | `[]` | Only include specific components/utilities |
| `exclude` | `[]` | Exclude specific components/utilities |

## Custom Themes

Define themes directly in your stylesheet using `@layer theme`:

```css
@layer theme {
  [data-theme="blueberry"] {
    --scheme-color: light;
    --color-primary: oklch(60% 0.2 220);
    --color-on-primary: oklch(98% 0.01 220);
    --color-base: oklch(98% 0.01 220);
    --color-on-base: oklch(20% 0.02 220);
  }
}
```

Apply any theme with a `data-theme` attribute:

```html
<body data-theme="blueberry">
  ...
</body>
```

That’s it — you’re ready to build with Frutjam components!

---

## Live Demo & Documentation

For full documentation and live interactive previews, visit our official site: 👉 **[frutjam](https://frutjam.com/docs)**

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the repo
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

Please check the [contributing guidelines](.github/CONTRIBUTING.md) before starting.

---

## 📄 License

Distributed under the MIT License. See [MIT License](LICENSE) for more information.

---

Thank you for choosing the Frutjam UI Library – Happy coding!

## ⭐ Support

If you like this project, consider giving it a star! 🌟

[![GitHub stars](https://img.shields.io/github/stars/nezanuha/frutjam.svg?style=social&label=Star&maxAge=2592000)](https://github.com/nezanuha/frutjam/stargazers)

---

[jsdelivr]: https://badgen.net/jsdelivr/hits/npm/frutjam
[npm_installs]: https://badgen.net/npm/dt/frutjam
