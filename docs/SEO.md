# SEO rules — writing a doc page

Ported from the Django project's `SEO_RULES.md`. The fields are now frontmatter
in `src/content/docs/<category>/<slug>.mdx`; category fields live in
`src/data/categories.json`. Nothing is generated from a database any more, so
what you write here is what ships.

## metaTitle (max 60 chars)

```
{Component Name} — CSS-Only Tailwind CSS {Category} | Frutjam
```

```
Button — CSS-Only Tailwind CSS Components | Frutjam
Modal — CSS-Only Tailwind CSS Components | Frutjam
Installation — CSS-Only Tailwind CSS Docs | Frutjam
```

## metaDescription (max 160 chars)

```
CSS-only Tailwind CSS {name} component. No JavaScript, WCAG AA accessible, works with Django, HTMX, Laravel, and any stack.
```

```
CSS-only Tailwind CSS Button component. No JavaScript, WCAG AA accessible, works with Django, HTMX, Laravel, and any stack.
CSS-only Tailwind CSS Modal component. No JavaScript, WCAG AA compliant, framework-agnostic. Works with React, Django, and HTMX.
```

## description (max 300 chars) — visible page content

Repeated as the **first visible paragraph** of the page and as the **card
description** on the category listing (/components, /blocks, /plugins). Google
reads it as the intro paragraph, so it is the primary on-page signal.

- **Unique per component** — identical descriptions read as thin content
- Describe what the component **actually does**: variants, sizes, features
- Include `CSS-only Tailwind CSS`, `WCAG AA`, and at least one of `Django`, `HTMX`, `Laravel`
- Never reuse the generic pattern for a new component

```
CSS-only Tailwind CSS {name} with {key variants/features}. {Sizes/states if relevant.}
WCAG AA accessible, works with Django, HTMX, Laravel, React, and any stack.
```

```
CSS-only Tailwind CSS button with primary, secondary, accent, ghost, outline, and soft variants.
Sizes xs-xl, loading state, disabled, and icon buttons. WCAG AA accessible,
works with Django, HTMX, Laravel, React, and any stack.
```

## Category description (`src/data/categories.json`)

The intro on /components, /docs, /blocks, /plugins.
- Never just the category name ("Docs") — that duplicates the heading
- Include CSS-only, WCAG AA, and the Django/HTMX/Laravel keywords

## Rules

- Always include `CSS-only` or `no JavaScript` — the differentiator against DaisyUI, Flowbite, Preline
- Always include `Tailwind CSS` plus the component name — the primary keywords
- No duplicate descriptions across pages
- `metaTitle` ≠ `heading`: the heading is for readers, the title is the search result
- `description` ≠ `metaDescription`: one is visible content, the other the search snippet
- Set `updatedAt` when you change a page: it feeds the sitemap, the JSON-LD and the "Updated" date

## Target keywords (weave in naturally)

Tier 1 (low competition, ranks fast):
- css only tailwind css components
- tailwind css no javascript components
- accessible tailwind css components
- wcag tailwind css ui library
- tailwind css htmx components
- tailwind css django components
- tailwind css laravel components
- pure css tailwind ui library
- tailwind css framework agnostic
- daisyui css only alternative
- tailwind css v4 components (emerging — very low competition)

Tier 2 (medium competition):
- free open source tailwind css library
- tailwind accessible components
- tailwind css semantic classes
- daisyui alternative free
- tailwind ui library no react

Tier 3 (long-term, high competition):
- tailwind css components
- tailwind css ui library
- tailwind ui alternative

### Cherry MCP page (/products/cherry)

- mcp server tailwind css components
- prevent ai hallucination tailwind css
- claude code mcp tailwind
- cursor mcp ui components
- vs code mcp server ui library
- tailwind v4 ai assistant accuracy
- model context protocol ui components
- ai coding assistant css class verification
- mcp server design system documentation

## Homepage comparison table

Keep these accurate:
- WCAG AA contrast guaranteed on every component (hand-tuned pairs, NOT computed at runtime)
- AI editor integration (Cherry MCP) — free, vs DaisyUI Blueprint (paid)
- Theme via plain CSS variables, no config file
- CSS-only (no JavaScript required)

## After publishing

Pushing to `main` deploys and submits the changed URLs to IndexNow (Bing,
Yandex) automatically. There is no cache to clear.
