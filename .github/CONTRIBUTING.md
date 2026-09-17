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

## 📝 Documentation and translations

### What lives where

| Path | What |
| --- | --- |
| `src/components/<name>/` | The component's CSS |
| `docs/src/content/docs/en/<category>/<slug>.mdx` | An English doc page |
| `docs/src/content/docs/<lang>/<category>/<slug>.mdx` | Its translations |
| `docs/src/content/blog/<slug>.md` | Blog posts (English only) |
| `docs/src/pages/index.astro`, `docs/src/pages/<lang>/index.astro` | Home page, per language |
| `docs/src/data/i18n/<lang>.json` | Interface strings (buttons, menus, labels) |
| `docs/src/data/categories.json` | Category names and descriptions, with translations |

A new `.mdx` file is a new page: the sidebar, previous/next links, sitemap,
search (Pagefind, built with the site), `.md` version and meta tags all follow from it.

### Adding or changing a doc page

1. Write the English page first: `docs/src/content/docs/en/components/<name>.mdx`.
2. Follow the format of a neighbouring page: frontmatter, the class table, then
   `<Snippet>` examples with an `html` block and a `jsx` block.
3. Titles and descriptions follow [docs/SEO.md](../docs/SEO.md).
4. Run `npm run build` in `docs/` — it must finish without errors.

Translations are welcome but never required. An English-only change is fine;
see below for what happens to the other languages.

### Translations

The site is published in 13 languages. English is at `frutjam.com/...` and the
rest under a prefix: `frutjam.com/ja/...`, `/de/...`, and so on.

**Languages:** English, 中文 (zh-hans), 繁體 (zh-hant), 日本語 (ja), 한국어 (ko),
Português (pt-br), Español (es), Deutsch (de), Türkçe (tr), Polski (pl),
Indonesia (id), Tiếng Việt (vi), Français (fr).

The existing translations were machine-translated and have not been reviewed by
native speakers. **Corrections are the most valuable contribution you can make
here.** If you read one of these languages, fixing awkward or wrong wording on a
page you know well is a real improvement, however small.

#### Keeping track of what needs translating

```sh
cd docs
npm run i18n:status
```

```
components/button
  stale:    ja de fr ko
components/dock
  missing:  zh-hans zh-hant ja ko pt-br es de tr pl id vi fr

63 pages × 12 languages: 16 need attention, 4 edited or reviewed by hand (never auto-translated).
```

Each translated page records two fingerprints in its frontmatter:

```yaml
sourceHash: "7b0461b5e6de"       # the English page it was translated from
translationHash: "7aadd3c295ce"  # this file as it was generated
```

- **`sourceHash` differs from the English page** → the English text changed and
  this translation is **stale**. The page still publishes, with a notice telling
  readers it may be out of date and linking to the English version.
- **`translationHash` differs from the file** → somebody **edited this
  translation by hand**. No script will ever overwrite it. Whoever edits it may
  drop the line entirely; the effect is the same.
- **`reviewed: true`** → checked by a speaker of the language. Also never
  overwritten, and it says so in the status report.

The build prints the same summary, so an out-of-date translation is visible
without anyone having to remember.

#### Becoming a reviewer for your language

If you speak one of these languages and would like to review changes to it,
open an issue or a pull request adding your GitHub handle to that language's
lines in [`.github/CODEOWNERS`](CODEOWNERS). GitHub will then ask you to review
every pull request that touches those pages. Mark pages you have checked with
`reviewed: true` in their frontmatter — no script will ever change their words.

#### Improving a translated page

Edit the file for that language, for example `docs/src/content/docs/ja/components/button.mdx`.
It is an ordinary MDX file with the same structure as the English one.

- **Translate the prose, the frontmatter `name`, `heading`, `description`,
  `metaTitle` and `metaDescription`** — everything a reader sees.
- **Never translate code.** Class names, HTML attributes, CSS and component
  names inside `<Snippet>` blocks stay exactly as they are; they are the API.
  You never need to update code in a translation either: code blocks, component
  tags and the class-name column are copied from the English page automatically
  every time the site builds.
- **Keep the headings in step with the English page.** Their order and meaning
  should match, since links point at them.
- **Keep inline code as it is**: a class name in backticks, like `badge-primary`,
  stays in English inside a translated sentence.

`npm run i18n:check` compares every translation with its English page. The
build **fails** if a translation changes a code sample, a component, the class
table or the headings — the page would show a different UI in that language —
and warns if inline code or a link changed.
- **Keep the frontmatter fields** `order`, `related`, `image`, `createdAt` and
  `updatedAt` identical to the English page.

#### Interface strings

Buttons, menus and labels shared by every page live in
`docs/src/data/i18n/<lang>.json`, keyed by the English text:

```json
{ "Search...": "検索...", "On this page": "このページでは" }
```

Delete a key and that string falls back to English, which is always safe.

#### When you edit an English page

Nothing breaks and nothing is blocked. **Changing code** (a code example, a
class name in the table) needs nothing else: the next build copies it into all
12 translations, and none of them become out of date.

**Changing wording**, or adding or removing a code example, marks the 12
translations out of date: they keep their old text and show a notice to readers
until someone updates them. `npm run i18n:status` lists what is waiting.

Updating a translated page means editing its file and, if you want the notice
to go away, copying the English page's current `sourceHash` (the status report
prints it) into the translated file. Hand edits are never overwritten, so a
correction you make survives every later run of any script.

#### Re-translating with a script (maintainers)

When nobody is available to translate, a maintainer can run a machine first pass
through Google Translate — the same service the old Django site used — then read
the result and commit it. It needs nothing beyond `npm install`:

```sh
cd docs
npm run i18n:translate
```

Contributors do not need to run this — please do not send pull requests of
unreviewed machine translation. What matters to you is that **it can never
touch your work**:

- It only writes pages reported as **stale** or **missing**. Anything edited by
  hand, or marked `reviewed: true`, is skipped and listed at the end.
- If the service fails or hands back the English text, that page is left exactly
  as it is and the run says so. Stale is better than replaced-by-English.
- Code blocks, inline code, class names, component tags and URLs are never sent
  to the translator.

Details are in [docs/README.md](../docs/README.md).

#### A new page in one language only

If you add an English page and cannot translate it, that is fine: the page
exists in English, and the other languages simply do not list it until someone
adds their file. Copying the English file into a language folder untranslated is
worse than leaving it out — it looks translated when it isn't.

### Images

Put files in `docs/public/images/` (examples) or `docs/public/media/` (page and
social images) and reference them as `https://cdn.frutjam.com/<path>`, adding
the size you display them at:

```html
<img src="https://cdn.frutjam.com/images/photo-1.jpg?width=600&height=400&format=webp" alt="…" />
```

The build creates that resized file. The supported parameters are listed in
[docs/README.md](../docs/README.md). An unsupported parameter, or an image that is
not in `public/`, fails the build.

---

## 🎨 Contributing a Theme

Community themes live in [`docs/src/styles/themes.css`](../docs/src/styles/themes.css). Adding yours is a CSS-only change.

### Add your theme to `themes.css`

Open `docs/src/styles/themes.css` and append a new block inside `@layer theme`. Theme names must follow the **Berry naming convention** — a fruit or jam-inspired name ending in *berry* (e.g. `mangoberry`, `limeberry`, `cherryberry`).

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

That is the whole change. The preview card on the themes page is generated
from `themes.css` by `docs/src/components/ThemeCards.astro`, so your theme
appears in the grid — in all 13 languages — with a copy button carrying its
declarations. There is no markup to write.

---

## 🎯 Cascade Specificity Rule

All component CSS must follow a strict cascade priority so inline Tailwind utilities always win:

```
1. Inline class on the element   e.g. class="badge bg-red-600"  → (0,1,0)  always wins
2. Parent component context      via CSS vars / color: inherit   → inherits naturally
3. Root baseline                 :where(:root) element {}        → lowest
```

### The problem this solves

Without this rule, a component rule like `.card-content p { font-size: 1rem }` has `(0,1,0)` specificity — the same as a user's inline class like `.text-sm`. Source order decides the winner randomly. Users can't reliably override component styles.

### Three patterns — pick the right one

**Pattern 1 — Descendant element rules: use `:where(&)` inside `@utility`**

`&` resolves to the utility class. `:where(&)` zeros its specificity to `(0,0,0)`.

```css
/* ❌ Wrong — .card-content contributes (0,1,0) */
@utility card-content {
    p { font-size: 1rem; }
    :where(p) { font-size: 1rem; }   /* still wrong — .card-content still contributes */
}

/* ✅ Correct — full selector is (0,0,0), any inline class on p wins */
@utility card-content {
    padding: 1rem;
    :where(&) :where(p) { font-size: 1rem; }
}
```

**Pattern 2 — CSS vars on descendants: set flat on parent utility**

CSS custom properties inherit naturally down the DOM tree — no descendant selector needed at all.

```css
/* ❌ Wrong — .card-xs .card-content = (0,2,0) */
@utility card-xs {
    & .card-content { --card-content-padding: 0.5rem; }
}

/* ✅ Correct — var set on .card-xs, inherits to .card-content child */
@utility card-xs {
    --card-content-padding: 0.5rem;
}
```

**Pattern 3 — State/variant overrides: use CSS vars on the base utility**

When a modifier needs to override a property already set by the base utility, add a CSS var to the base and set it from the modifier.

```css
/* ❌ Wrong — .chat-end .chat-bubble = (0,2,0), user can't override */
@utility chat-end {
    & .chat-bubble { background-color: var(--color-primary); }
}

/* ✅ Correct — chat-bubble reads the var, chat-end sets it */
@utility chat-bubble {
    background-color: var(--chat-bubble-bg, var(--color-base-soft));
}
@utility chat-end {
    --chat-bubble-bg: var(--color-primary);
}
```

### Quick decision table

| Situation | Pattern |
|---|---|
| Styles on the utility element itself | Inside `@utility` normally — no change needed |
| Descendant element rules | `:where(&) :where(child) {}` inside `@utility` |
| Only setting CSS vars on descendants | Flat on parent utility — no descendant selector at all |
| Variant overrides a base utility property | CSS var on the base, set by the variant |

> **Note:** Never write `@utility foo {}` with an empty body — Tailwind v4 requires at least one property per utility block.

---

## 💡 Contribution Ideas

* Fix bugs or inconsistencies
* Add more prebuilt themes
* Improve accessibility in components
* Write or improve documentation
* Help with automated testing setup

---

## 🧪 Development Setup

The CSS library, from the repository root:

```bash
npm install
npm run dev
```

The website (frutjam.com), which is a separate Astro project:

```bash
cd docs
npm install
npm run dev          # http://localhost:4321
npm run build        # the static site, in dist/
```

---

## 📜 Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful and inclusive in all interactions. Report unacceptable behavior to [security@nezanuha.com](mailto:security@nezanuha.com).

---

Thanks again for contributing!
— *The Frutjam Team*
