/**
 * Keeps the code in every translation identical to English: `npm run i18n:sync`.
 *
 * Code is not translation. A code block, a <Snippet>/<DocTable> tag, a class
 * name in the reference table or a badge's classes is the same in all 13
 * languages, so maintaining it 13 times would only let the copies drift. This
 * copies those parts from each English page into its translations and leaves
 * every word alone — so it is safe on translations people edited by hand too.
 *
 * It runs at the start of `npm run dev` and `npm run build`: change a code
 * example in English and every language shows the new one.
 *
 * It only syncs a translation whose layout still lines up with English (the
 * same code blocks, components and table rows in the same order). When English
 * gains or loses a block, the new example usually comes with new explanation,
 * so that translation is reported stale instead (`npm run i18n:status`) and
 * `npm run i18n:translate` rebuilds it.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { segments, skeleton } from './i18n-hash.mjs';

const DEFAULT_DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');
const DEFAULT_LANG = 'en';
const CLASS_TOKEN = /^[a-z0-9][\w\-.:/[\]]*$/;
const TABLE_SEPARATOR = /^\|[\s:|-]+\|$/;

/** Splits a page into frontmatter (kept verbatim) and body. */
function split(source) {
  const match = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  return match ? { head: match[1], body: match[2] } : { head: '', body: source };
}

/**
 * A table row from English, with the translation's words: class cells and
 * badge tags come from English, labels and descriptions stay translated.
 */
function syncRow(englishRow, translatedRow, classTable) {
  if (TABLE_SEPARATOR.test(englishRow.trim())) return englishRow;
  // Only a <DocTable> class reference holds code in its cells; any other
  // table (options, shortcuts, defaults) is words and stays translated.
  if (!classTable) return translatedRow;
  const english = englishRow.split('|');
  const translated = translatedRow.split('|');
  if (english.length !== translated.length) return translatedRow;
  return translated
    .map((cell, i) => {
      const source = english[i];
      // split('|') leaves '' before the first pipe, so the class column is 1.
      if (i === 1 && CLASS_TOKEN.test(source.trim())) return source;
      const tag = source.match(/<span\b[^>]*>/);
      return tag ? cell.replace(/<span\b[^>]*>/, tag[0]) : cell;
    })
    .join('|');
}

/** The translated body with English's code and markup, or null if they no longer line up. */
export function syncBody(englishBody, translatedBody) {
  if (skeleton(englishBody) !== skeleton(translatedBody)) return null;
  const code = segments(englishBody).filter((s) => s.type !== 'text');
  let k = 0;
  return segments(translatedBody)
    .map((segment) => {
      if (segment.type === 'text') return segment.text;
      const english = code[k++];
      return segment.type === 'table' ? syncRow(english.text, segment.text, segment.classTable) : english.text;
    })
    .join('\n');
}

export function syncAll(DOCS = DEFAULT_DOCS) {
  const languages = readdirSync(DOCS).filter((name) => name !== DEFAULT_LANG && statSync(join(DOCS, name)).isDirectory());
  const walk = (dir, base) => readdirSync(dir).flatMap((name) =>
    statSync(join(dir, name)).isDirectory() ? walk(join(dir, name), `${base}${name}/`)
      : name.endsWith('.mdx') ? [`${base}${name.slice(0, -4)}`] : []);

  const synced = [];
  const misaligned = [];
  for (const page of walk(join(DOCS, DEFAULT_LANG), '')) {
    const english = split(readFileSync(join(DOCS, DEFAULT_LANG, `${page}.mdx`), 'utf8')).body;
    for (const lang of languages) {
      const file = join(DOCS, lang, `${page}.mdx`);
      if (!existsSync(file)) continue;
      const source = readFileSync(file, 'utf8');
      const { head, body } = split(source);
      const next = syncBody(english, body);
      if (next === null) {
        misaligned.push(`${lang}/${page}`);
      } else if (next !== body) {
        writeFileSync(file, head + next);
        synced.push(`${lang}/${page}`);
      }
    }
  }
  return { synced, misaligned };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { synced, misaligned } = syncAll();
  console.log(`Copied code and markup from English into ${synced.length} translated pages.`);
  for (const page of synced) console.log(`  ${page}`);
  if (misaligned.length) {
    console.log(`\n${misaligned.length} translations no longer line up with English (a block was added or removed) — stale, see npm run i18n:status:`);
    for (const page of misaligned) console.log(`  ${page}`);
  }
}
