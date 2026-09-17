import { cpSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import * as pagefind from 'pagefind';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import rehypeDocHeadings from './src/lib/rehype-doc-headings.mjs';
import remarkSnippetFences from './src/lib/remark-snippet-fences.mjs';
import imageVariants from './src/lib/image-variants.mjs';
import { i18nStatus, isProtected, needsTranslation } from './scripts/i18n-status.mjs';
import { checkStructure } from './scripts/i18n-structure.mjs';
import { syncAll } from './scripts/i18n-sync.mjs';

const SITE = 'https://frutjam.com';
const FRUTJAM_VERSION = JSON.parse(
  readFileSync(new URL('./node_modules/frutjam/package.json', import.meta.url), 'utf8')
).version;

/**
 * Doc previews import `frutjam/js` (modal, drawer, carousel, combobox...)
 * through an import map, as frutjam.com did. Serve the installed package's
 * helpers so previews always run the version the CSS came from.
 */
function frutjamJs() {
  return {
    name: 'frutjam-js',
    hooks: {
      'astro:config:setup': () => {
        cpSync(
          new URL('./node_modules/frutjam/packages/js/', import.meta.url),
          new URL('./public/_frutjam/js/', import.meta.url),
          { recursive: true }
        );
      },
    },
  };
}

/** Says which translations the build is shipping out of date (npm run i18n:status). */
function translationStatus() {
  return {
    name: 'translation-status',
    hooks: {
      // Code is the same in every language: copy it from English before
      // anything reads the content, so `npm run dev` and `npm run build` both
      // show a changed code example in all 13 languages (npm run i18n:sync).
      'astro:config:setup': ({ logger }) => {
        const { synced, misaligned } = syncAll();
        if (synced.length) logger.info(`copied code from English into ${synced.length} translated pages`);
        if (misaligned.length) logger.info(`${misaligned.length} translations no longer line up with English; they are stale (npm run i18n:status)`);
      },
      'astro:build:start': ({ logger }) => {
        const { languages, rows } = i18nStatus();
        const pending = rows.flatMap((row) => languages.filter((lang) => needsTranslation(row.states[lang])));
        const held = rows.flatMap((row) => languages.filter((lang) => isProtected(row.states[lang])));
        if (pending.length) {
          const pages = rows.filter((row) => languages.some((lang) => needsTranslation(row.states[lang])));
          logger.warn(
            `${pending.length} translations are out of date or missing, across ${pages.length} pages ` +
            `(${pages.slice(0, 3).map((p) => p.page).join(', ')}${pages.length > 3 ? ', …' : ''}). ` +
            'Run `npm run i18n:status` for the list; the pages still build, with a notice for readers.'
          );
        }
        if (held.length) logger.info(`${held.length} translations edited or reviewed by hand; scripts leave those alone.`);

        // A translation may change words, never the page. A different code
        // sample, component, class table or heading would show readers a
        // different UI in that language, so the build stops.
        //
        // Only for translations made from the current English page, though:
        // once English itself changes, every translation differs until it is
        // updated. That is staleness — shipped with a notice for readers, and
        // never a reason to block an English edit.
        const state = new Map(rows.flatMap((row) => languages.map((lang) => [`${lang}/${row.page}`, row.states[lang]])));
        // Stale translations are already reported above; only translations of
        // the current English page are checked here.
        const problems = checkStructure().problems.filter((p) =>
          ['current', 'edited', 'reviewed'].includes(state.get(`${p.lang}/${p.page}`)));
        const layout = problems.filter((p) => p.found.some((line) => /^(code|components|classes|headings) /.test(line)));
        if (layout.length) {
          const list = layout.slice(0, 5).map((p) => `${p.lang}/${p.page}: ${p.found.join('; ')}`).join('\n  ');
          throw new Error(`${layout.length} translated pages differ from English in structure (npm run i18n:check):\n  ${list}`);
        }
        const wording = problems.length - layout.length;
        if (wording) {
          logger.warn(`${wording} translated pages changed inline code or links in their text. Run \`npm run i18n:check -- --fix\`; what it cannot align is listed for a person.`);
        }
      },
    },
  };
}

/**
 * Full-text search, built from the finished HTML (the search modal reads it).
 * Pagefind indexes whatever carries `data-pagefind-body` — doc and category
 * pages — and splits the index by each page's <html lang>, so every language
 * searches its own pages. Runs last, after image URLs have been rewritten.
 */
function search() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const site = fileURLToPath(dir);
        const { index, errors } = await pagefind.createIndex({});
        if (!index) throw new Error(`Pagefind could not start: ${errors.join('; ')}`);
        const { page_count: pages, errors: indexErrors } = await index.addDirectory({ path: site });
        if (indexErrors.length) throw new Error(`Pagefind indexing failed: ${indexErrors.join('; ')}`);
        await index.writeFiles({ outputPath: join(site, 'pagefind') });
        await pagefind.close();
        logger.info(`search index built from ${pages} pages`);
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // Optional: serve built CSS/JS from another host. cdn.frutjam.com shares
  // this site's document root, so it is only worth setting if that name ever
  // moves to a real CDN again. Set it once that host serves these files.
  build: {
    // page.html, not page/index.html: static hosts redirect a directory
    // index to a trailing slash, and frutjam.com URLs never had one.
    format: 'file',
    assetsPrefix: process.env.ASSETS_PREFIX || undefined,
  },
  markdown: {
    // frutjam.com rendered Markdown with python-markdown: plain fenced code,
    // straight quotes. Doc code samples are highlighted by <Snippet>.
    syntaxHighlight: false,
    // remarkSnippetFences only acts on MDX <Snippet> elements.
    processor: unified({ smartypants: false, remarkPlugins: [remarkSnippetFences], rehypePlugins: [rehypeDocHeadings] }),
  },
  vite: {
    plugins: [tailwindcss()],
    define: { __FRUTJAM_VERSION__: JSON.stringify(FRUTJAM_VERSION) },
  },
  integrations: [
    frutjamJs(),
    mdx(),
    imageVariants(),
    translationStatus(),
    search(),
  ],
});
