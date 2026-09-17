/**
 * What needs translating: `npm run i18n:status`.
 *
 * For every English doc page it compares each language's file against the
 * fingerprints written in its frontmatter (scripts/i18n-hash.mjs):
 *
 *   missing   no file in that language
 *   stale     the English page changed after this was translated
 *   edited    somebody edited the translation by hand (protected from scripts)
 *   reviewed  checked by a speaker of the language (also protected)
 *
 * `--json` prints the same data for other tools; `--quiet` prints only the
 * summary line. Exits 0 always: stale translations are not a build failure.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprint, parseMdx, skeleton } from './i18n-hash.mjs';

const DEFAULT_DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');
const DEFAULT_LANG = 'en';

export function i18nStatus(DOCS = DEFAULT_DOCS) {
  const languages = readdirSync(DOCS).filter((name) => statSync(join(DOCS, name)).isDirectory() && name !== DEFAULT_LANG).sort();

  const pages = [];
  const walk = (dir, base) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path, `${base}${name}/`);
      else if (name.endsWith('.mdx')) pages.push(`${base}${name.replace(/\.mdx$/, '')}`);
    }
  };
  walk(join(DOCS, DEFAULT_LANG), '');

  const rows = [];
  for (const page of pages.sort()) {
    const english = parseMdx(readFileSync(join(DOCS, DEFAULT_LANG, `${page}.mdx`), 'utf8'));
    const sourceHash = fingerprint(english.fields, english.body);
    const englishLayout = skeleton(english.body);
    const states = {};
    for (const lang of languages) {
      const file = join(DOCS, lang, `${page}.mdx`);
      if (!existsSync(file)) {
        states[lang] = 'missing';
        continue;
      }
      const { fields, body } = parseMdx(readFileSync(file, 'utf8'));
      const edited = fields.translationHash !== fingerprint(fields, body);
      // Stale: the English words changed, or English gained or lost a code
      // block — a new example usually brings new explanation to translate.
      // A changed code block alone is not staleness; npm run i18n:sync copies it.
      const stale = fields.sourceHash !== sourceHash || skeleton(body) !== englishLayout;
      states[lang] = fields.reviewed === 'true' || fields.reviewed === true
        ? (stale ? 'reviewed-stale' : 'reviewed')
        : edited
          ? (stale ? 'edited-stale' : 'edited')
          : stale ? 'stale' : 'current';
    }
    rows.push({ page, sourceHash, states });
  }
  return { languages, rows };
}

const PROTECTED = new Set(['edited', 'edited-stale', 'reviewed', 'reviewed-stale']);
export const needsTranslation = (state) => state === 'missing' || state === 'stale';
export const isProtected = (state) => PROTECTED.has(state);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const { languages, rows } = i18nStatus();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ languages, rows }, null, 2));
  } else {
    const quiet = process.argv.includes('--quiet');
    let pending = 0;
    for (const { page, states } of rows) {
      const missing = languages.filter((l) => states[l] === 'missing');
      const stale = languages.filter((l) => states[l] === 'stale');
      const attention = languages.filter((l) => states[l] === 'edited-stale' || states[l] === 'reviewed-stale');
      pending += missing.length + stale.length + attention.length;
      if (quiet || (!missing.length && !stale.length && !attention.length)) continue;
      console.log(page);
      if (missing.length) console.log(`  missing:  ${missing.join(' ')}`);
      if (stale.length) console.log(`  stale:    ${stale.join(' ')}`);
      // Hand-edited or reviewed pages are never overwritten; they need a person.
      if (attention.length) console.log(`  stale, edited by hand (needs a person): ${attention.join(' ')}`);
    }
    const protectedCount = rows.reduce((n, r) => n + languages.filter((l) => isProtected(r.states[l])).length, 0);
    console.log(
      `\n${rows.length} pages × ${languages.length} languages: ${pending} need attention, ` +
      `${protectedCount} edited or reviewed by hand (never auto-translated).`
    );
  }
}
