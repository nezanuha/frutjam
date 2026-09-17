# frutjam.com

The Frutjam website and documentation, built with Astro and Frutjam UI.

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # static site in dist/
```

## Deploying

Pushing a change under `docs/` to `main` runs `.github/workflows/deploy-docs.yml`,
which builds the site and uploads `dist/` to Hostinger over SSH. `public/.htaccess`
travels with the build and holds the URL rules (no trailing slash, the old
Django redirects, caching). `cdn.frutjam.com` shares the same document root, so
the image URLs the Django site published keep working.

## Content

- Docs: `src/content/docs/<lang>/<category>/<slug>.mdx` — English under `en/`,
  translations under `ja/`, `de/`, … and served at `/ja/components/button`
- Blog: `src/content/blog/<slug>.md` (English only)
- Interface strings: `src/data/i18n/<lang>.json`
- Home and Cherry pages: `src/pages/index.astro`, `src/pages/<lang>/index.astro`

```sh
npm run i18n:status      # what is stale, missing, or edited by hand
npm run i18n:sync        # copy code from English into translations (also runs on dev/build)
npm run i18n:check       # translations must keep English's code, classes and layout
npm run i18n:check -- --fix   # restore inline code a translation altered
npm run i18n:translate   # machine-translate the stale pages (Google Translate)
npm run i18n:translate -- components/button --lang ja,de --dry-run
npm run i18n:translate -- --check    # does the translation service answer from here?
```

`i18n:translate` is a maintainer tool: it writes machine translation, so read the
diff before committing. It only touches pages that are stale or missing, never a
translation somebody edited by hand or marked `reviewed: true`, and it writes
nothing at all if the translation service fails. It tries three endpoints in
turn, so a rate-limited one is not the end of the run; `GOOGLE_TRANSLATE_API_KEY`
switches it to the paid Cloud Translation API. Expect roughly a minute per page
per language.

The 13 languages are listed in `src/lib/i18n.ts`. `npm run i18n:status` shows
which translations are stale, missing, or edited by hand; the build prints the
same summary and stale pages carry a notice for readers. See ../.github/CONTRIBUTING.md
for how to add or improve a translation.

## Images

Put image files in `public/images/` (examples, pages) or `public/media/` (doc and
blog cover images). They are served from `https://cdn.frutjam.com/<path>`.

To show a resized or converted copy, add parameters to the URL:

```html
<img src="https://cdn.frutjam.com/images/photo-1.jpg?width=600&height=400&format=webp" alt="…" />
```

The build generates that exact file (here `photo-1.w600-h400.webp`) and points
the page at it, so use the size the image is displayed at.

| Parameter | Example | Effect |
| --- | --- | --- |
| `width`, `height` | `width=600&height=400` | Resize; with both, crop to fill |
| `format` | `webp`, `jpeg`, `png`, `avif` | Convert |
| `quality` | `quality=80` | Encoder quality (default 85) |
| `crop_gravity` | `center`, `north`, `southwest`… | Which part to keep when cropping |
| `face_crop` | `face_crop=true` | Keep the most detailed area (portraits) |
| `saturation` | `saturation=-100` | Grayscale |

An unsupported parameter, or an image that is not in `public/`, fails the build.
URLs inside code samples are left as written. `npm run dev` shows the original
image; resizing happens in `npm run build`.
