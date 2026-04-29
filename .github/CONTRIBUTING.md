# 🤝 Contributing to Frutjam

Thank you for your interest in contributing to **Frutjam**! Whether you're fixing bugs, improving documentation, or adding new features, your contributions help make this library better for everyone.

---

## 📋 How to Contribute

### 1. Fork the Repository

Click the **Fork** button on the [GitHub repo](https://github.com/nezanuha/frutjam) and clone your fork locally:

```bash
git clone https://github.com/nezanuha/frutjam.git
cd frutjam
````

### 2. Create a New Branch

Name your branch clearly based on what you're working on:

```bash
git checkout -b fix/button-focus-state
```

### 3. Make Your Changes

Follow the existing coding style. If you're adding UI components or themes:

* Keep accessibility in mind (use semantic HTML and ARIA where needed)
* Use Tailwind utility classes
* Keep components composable and minimal

### 4. Test Your Changes

Please test thoroughly. If possible, preview your changes in a test project using the library locally.

### 5. Commit and Push

Write clear, concise commit messages:

```bash
git commit -m "Fix: incorrect button focus state"
git push origin fix/button-focus-state
```

### 6. Submit a Pull Request

Open a pull request on the main repo. In your PR description, include:

* What your change does
* Why it's needed
* Screenshots or code samples, if relevant

---

## 🔁 The `@copy` Rule

Frutjam ships a custom build-time rule called `@copy`. It lets one `@utility` block inline the CSS body of another, removing the need to repeat declarations or reach for `@apply`.

### How it works

`@copy <name>;` is replaced at build time with the **full CSS body** of the named `@utility` block. It is resolved by Frutjam's PostCSS plugin before anything reaches the browser — there is no runtime cost.

```css
@utility btn {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
}

@utility card {
  @copy btn;          /* expands to the three declarations above */
  background: var(--color-base);
  border: 1px solid;
}
```

After build, `card` is equivalent to:

```css
@utility card {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background: var(--color-base);
  border: 1px solid;
}
```

### Rules and constraints

- `@copy` must appear **inside a `@utility` block** — it is not valid at the top level or inside `@layer` directly.
- The referenced utility must be defined somewhere in the CSS that Frutjam processes (any component or utility file in `src/`). Order does not matter — the full map is built before any `@copy` is resolved.
- If the referenced utility name does not exist, the `@copy` line is left as-is in the output (no silent data loss).
- Only the **body** is copied — not the `@utility` wrapper itself. Declarations land directly in the calling block.
- `@copy` does not support chaining arguments or selectors — one name per statement.

### When to use it

Use `@copy` when a component genuinely shares a structural base with another and you want a single source of truth for those declarations. Avoid it as a shortcut for loose stylistic similarities — prefer explicit declarations when the relationship is coincidental.

---

## 📝 Updating Component Content (`content/*`)

Component documentation lives in `content/components/`. Each file is an HTML page that uses the `<c-snippet>` component to show live previews alongside syntax-highlighted code.

### `<c-snippet>` — Code Snippet Component

Show a live preview and code block for one language using the `lang` prop:

```html
<c-snippet>
  <button class="btn">Click me</button>
</c-snippet>

<c-snippet lang="css">
  .btn { color: red; }
</c-snippet>

<c-snippet lang="js">
  console.log('hello');
</c-snippet>
```

**Props:**

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `lang` | `html`, `css`, `js`, `python`, etc. | `html` | Language for syntax highlighting |
| `view` | `both`, `preview`, `code` | `both` | What to display |
---

## 🎨 Contributing a Theme

Community themes live in [`content/assets/themes.css`](../content/assets/themes.css). Adding yours takes two steps.

### Step 1 — Add your theme to `themes.css`

Open `content/assets/themes.css` and append a new block inside `@layer theme`. Theme names must follow the **Berry naming convention** — a fruit or jam-inspired name ending in *berry* (e.g. `mangoberry`, `limeberry`, `cherryberry`).

```css
@layer theme {
  :is([data-theme="mangoberry"]) {
    --scheme-color: light;        /* "light" or "dark" */
    --border-radius: 0.25rem;

    --color-base: oklch(98% 0.015 80);
    --color-on-base: oklch(22% 0.03 70);

    --color-neutral: oklch(88% 0.025 75);
    --color-on-neutral: oklch(24% 0.03 70);

    --color-primary: oklch(70% 0.19 65);
    --color-on-primary: oklch(20% 0.06 60);

    --color-secondary: oklch(72% 0.16 40);
    --color-on-secondary: oklch(20% 0.05 38);

    --color-accent: oklch(76% 0.17 100);
    --color-on-accent: oklch(20% 0.06 95);

    --color-info: oklch(68% 0.17 237);
    --color-on-info: oklch(18% 0.06 230);

    --color-success: oklch(72% 0.18 150);
    --color-on-success: oklch(20% 0.06 155);

    --color-warning: oklch(82% 0.19 88);
    --color-on-warning: oklch(24% 0.07 60);

    --color-error: oklch(58% 0.23 25);
    --color-on-error: oklch(97% 0.005 20);
  }
}
```

All color scales (50–950), soft, and active variants are computed automatically — you only define the tokens above.

> **Contrast tip:** Every `on-{color}` pair must pass WCAG AA (4.5:1). Test your pairs at [oklch.com](https://oklch.com) before submitting.

### Step 2 — Add a preview card to `themes.html`

Open `content/docs/themes.html` and add a `<c-theme>` card to the grid at the top of the file, using the same name from Step 1.

```html
<div class="grid grid-cols-5 gap-3">
  <!-- existing themes … -->
  <c-theme theme="mangoberry"></c-theme>
</div>
```

Open a pull request with both file changes and your theme will appear in the preview grid on the docs site.

---

## 💡 Contribution Ideas

* Fix bugs or inconsistencies
* Add more prebuilt themes
* Improve accessibility in components
* Write or improve documentation
* Help with automated testing setup

---

## 🧪 Development Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

---

## 📜 Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) Code of Conduct. Be respectful and inclusive in all interactions.

---

Thanks again for contributing!
— *The Frutjam Team*
