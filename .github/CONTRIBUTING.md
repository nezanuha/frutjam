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
