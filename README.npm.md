# Frutjam

CSS-only Tailwind CSS v4 component library. 65+ accessible, copy-paste UI components — zero JavaScript, WCAG AA guaranteed, framework-agnostic.

**[frutjam.com](https://frutjam.com)** · [Components](https://frutjam.com/components) · [Docs](https://frutjam.com/docs) · [Cherry MCP](https://frutjam.com/cherry)

---

## Install

```bash
npm install -D frutjam
```

```css
@import "tailwindcss";
@plugin "frutjam";
```

That's it. All 65+ components available immediately.

---

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frutjam/dist/frutjam.min.css" />
```

---

## Usage

```html
<!-- Button -->
<button class="btn btn-primary">Get Started</button>
<button class="btn btn-outline">Cancel</button>

<!-- Badge -->
<span class="badge badge-success">Active</span>
<span class="badge badge-error badge-soft">Error</span>

<!-- Alert -->
<div class="alert alert-success">Saved successfully.</div>

<!-- Card -->
<div class="card">
  <div class="card-content">
    <h2 class="heading-lg">Title</h2>
    <p class="para">Content goes here.</p>
  </div>
</div>

<!-- Input -->
<input type="text" class="input" placeholder="Enter text...">

<!-- CSS-only modal — no JavaScript -->
<button popovertarget="modal" class="btn btn-primary">Open</button>
<dialog id="modal" popover class="modal">
  <div class="modal-content">
    <h3 class="heading-lg">Modal title</h3>
    <button popovertarget="modal" class="btn mt-4">Close</button>
  </div>
</dialog>
```

---

## Plugin Options

```css
@plugin "frutjam" {
  prefix: fj;    /* fj-btn, fj-card, etc. */
  reset: true;   /* browser reset (default: true) */
}
```

---

## 🍒 Cherry MCP — Stop AI from hallucinating class names

Cherry is a free MCP server that gives Claude Code, Cursor, and VS Code accurate real-time Frutjam docs — no more invented class names.

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

[**Get Cherry →**](https://frutjam.com/cherry)

---

## Links

- [Full documentation](https://frutjam.com/docs)
- [All 65+ components](https://frutjam.com/components)
- [UI Blocks](https://frutjam.com/blocks)
- [Themes](https://frutjam.com/docs/themes)
- [GitHub](https://github.com/nezanuha/frutjam)
- [Discord](https://discord.gg/FvjytjQSSZ)

## License

MIT
