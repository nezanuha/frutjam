/**
 * Translations may change words, never the page: `npm run i18n:check`.
 *
 * Compares every translated doc page with its English source and reports any
 * difference a reader would see as a different UI rather than a different
 * language:
 *
 *   code        a code sample (fenced block) differs — examples must be identical
 *   components  a <Snippet>, <DocTable>, <RawHtml>, <ThemeCards> tag or import differs
 *   classes     a class name in the reference table differs, or a row is missing
 *   headings    a heading was added or dropped (the table of contents changes)
 *   inline      an inline `code` span differs — class names in prose
 *   links       a link points somewhere the English page does not
 *
 * Exits 1 when anything differs, so the build and CI can refuse it.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprint, parseMdx } from './i18n-hash.mjs';

const DEFAULT_DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');
const DEFAULT_LANG = 'en';

/** The parts of a page that must not change between languages. */
export function structure(body) {
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  const code = [];
  const components = [];
  const classes = [];
  const headings = [];
  const inline = [];
  const links = [];

  let fence = null;
  let buffer = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (fence) {
      if (trimmed.startsWith(fence)) {
        code.push(buffer.join('\n'));
        fence = null;
        buffer = [];
      } else {
        buffer.push(line);
      }
      continue;
    }
    const open = trimmed.match(/^(`{3,})(.*)$/);
    if (open) {
      fence = open[1];
      buffer = [`lang:${open[2].trim()}`];
      continue;
    }
    if (/^(import |<\/?(Snippet|DocTable|ThemeCards)\b|<RawHtml\b)/.test(trimmed)) {
      // RawHtml carries markup; compare its tags and classes, not its text.
      components.push(trimmed.startsWith('<RawHtml')
        ? `RawHtml:${[...trimmed.matchAll(/class=\\?"([^"\\]*)/g)].map((m) => m[1]).join('|')}`
        : trimmed);
      continue;
    }
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && !/^\|[\s:|-]+\|$/.test(trimmed)) {
      const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim());
      // The first column of a reference table is the class name.
      if (/^[a-z0-9][\w\-.:/[\]]*$/.test(cells[0])) classes.push(cells[0]);
      else classes.push('(header)');
      continue;
    }
    const heading = trimmed.match(/^(#{1,6}) /);
    if (heading) headings.push(heading[1].length);
    for (const m of trimmed.matchAll(/`([^`]+)`/g)) inline.push(m[1]);
    for (const m of trimmed.matchAll(/\]\(([^)]+)\)|href=\\?"([^"\\]+)/g)) links.push(m[1] ?? m[2]);
  }
  return { code, components, classes, headings, inline: inline.sort(), links: links.sort() };
}

function differences(english, translated) {
  const found = [];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const key of ['code', 'components', 'classes', 'headings']) {
    if (!same(english[key], translated[key])) {
      const index = english[key].findIndex((value, i) => !same(value, translated[key][i]));
      const count = `${translated[key].length} vs ${english[key].length}`;
      const sample = index >= 0
        ? ` — first at #${index + 1}: ${JSON.stringify(String(translated[key][index] ?? '(missing)').slice(0, 70))}`
        : '';
      found.push(`${key} (${count})${sample}`);
    }
  }
  // Inline code and links: a translator may move them within a sentence, so
  // compare as sets, and ignore links that only gained a language prefix.
  const missing = (a, b) => a.filter((x) => !b.includes(x));
  const inlineLost = missing(english.inline, translated.inline);
  if (inlineLost.length) found.push(`inline code changed: ${inlineLost.slice(0, 3).map((x) => `\`${x}\``).join(', ')}`);
  const stripLang = (href) => href.replace(/^(https:\/\/frutjam\.com)?\/(zh-hans|zh-hant|ja|ko|pt-br|es|de|tr|pl|id|vi|fr)(?=\/)/, '$1');
  const linkLost = missing(english.links, translated.links.map(stripLang));
  if (linkLost.length) found.push(`links changed: ${linkLost.slice(0, 3).join(', ')}`);
  return found;
}


// ── Repairing inline code ────────────────────────────────────────────────────

/** Inline `code` spans in prose and tables, in order, with where they sit. */
function inlineSpans(body) {
  const spans = [];
  let offset = 0;
  let fence = null;
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const open = trimmed.match(/^(`{3,})/);
    if (fence) {
      if (trimmed.startsWith(fence)) fence = null;
    } else if (open) {
      fence = open[1];
    } else if (!/^(import |<)/.test(trimmed)) {
      // A line that shows the backtick key itself (the shortcut for inline
      // code) pairs its backticks wrongly, so text between two code spans
      // would look like code. Those lines are left for a person.
      if (/``|\\`/.test(line)) {
        offset += line.length + 1;
        continue;
      }
      for (const m of line.matchAll(/`([^`\n]+)`/g)) {
        // Real inline code does not start or end with a space or hold a table
        // separator; a match that does is prose caught between two spans.
        if (/^\s|\s$/.test(m[1]) || m[1].includes('|')) continue;
        spans.push({ value: m[1], start: offset + m.index + 1, end: offset + m.index + 1 + m[1].length });
      }
    }
    offset += line.length + 1;
  }
  return spans;
}

/** Same code once invisible characters, spacing and case are set aside. */
const loose = (value) => value.normalize('NFKC').replace(/[\u200b-\u200d\ufeff\u00a0\s]/g, '').toLowerCase();

/**
 * Puts the English value back into every inline code span a translation
 * altered. Spans are matched in order: exact or loose matches anchor the
 * alignment, and between two anchors the unmatched spans are paired one to one
 * when both sides have the same number. Anything else is left for a person.
 */
export function repairInline(englishBody, translatedBody) {
  const english = inlineSpans(englishBody);
  const translated = inlineSpans(translatedBody);

  // Longest common subsequence on the loose form: the spans both kept.
  const n = english.length;
  const m = translated.length;
  const table = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = loose(english[i].value) === loose(translated[j].value)
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const anchors = [];
  for (let i = 0, j = 0; i < n && j < m;) {
    if (loose(english[i].value) === loose(translated[j].value)) anchors.push([i++, j++]);
    else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }

  // Word order differs between languages: a span that is already a correct
  // English value somewhere on the page was moved, not broken, and must never
  // be "repaired" into a different one.
  const englishValues = new Set(english.map((span) => loose(span.value)));
  const translatedValues = new Set(translated.map((span) => loose(span.value)));

  const replacements = [];
  let unresolved = 0;
  let previous = [-1, -1];
  for (const anchor of [...anchors, [n, m]]) {
    // Only the broken spans (no English equivalent) and the English spans the
    // translation lost are candidates; pair them only when they match up one to one.
    const broken = translated.slice(previous[1] + 1, anchor[1]).filter((span) => !englishValues.has(loose(span.value)));
    const lost = english.slice(previous[0] + 1, anchor[0]).filter((span) => !translatedValues.has(loose(span.value)));
    if (broken.length === lost.length) {
      broken.forEach((span, k) => replacements.push([span, lost[k].value]));
    } else {
      unresolved += Math.max(broken.length, lost.length);
    }
    if (anchor[0] < n) {
      const [i, j] = anchor;
      if (english[i].value !== translated[j].value) replacements.push([translated[j], english[i].value]);
    }
    previous = anchor;
  }

  let body = translatedBody;
  let changed = 0;
  for (const [span, value] of replacements.sort((a, b) => b[0].start - a[0].start)) {
    if (span.value === value) continue;
    body = body.slice(0, span.start) + value + body.slice(span.end);
    changed++;
  }
  return { body, changed, unresolved };
}

export function fixInline(DOCS = DEFAULT_DOCS) {
  const languages = readdirSync(DOCS).filter((name) => name !== DEFAULT_LANG && statSync(join(DOCS, name)).isDirectory());
  let files = 0;
  let spans = 0;
  const manual = [];
  const handEdited = [];
  for (const lang of languages) {
    const walk = (dir, base) => readdirSync(dir).flatMap((name) =>
      statSync(join(dir, name)).isDirectory() ? walk(join(dir, name), `${base}${name}/`)
        : name.endsWith('.mdx') ? [`${base}${name.slice(0, -4)}`] : []);
    for (const page of walk(join(DOCS, lang), '')) {
      const englishFile = join(DOCS, DEFAULT_LANG, `${page}.mdx`);
      if (!existsSync(englishFile)) continue;
      const file = join(DOCS, lang, `${page}.mdx`);
      const source = readFileSync(file, 'utf8');
      const { fields, body } = parseMdx(source);
      const { body: fixed, changed, unresolved } = repairInline(parseMdx(readFileSync(englishFile, 'utf8')).body, body);
      if (unresolved) manual.push(`${lang}/${page} (${unresolved})`);
      if (!changed) continue;

      // Restoring code is a correction, not a translation, but a page someone
      // edited by hand is still theirs: report it instead of touching it.
      const machineMade = fields.translationHash === fingerprint(fields, body) && !fields.reviewed;
      if (!machineMade) {
        handEdited.push(`${lang}/${page} (${changed})`);
        continue;
      }
      let output = source.replace(body, fixed);
      output = output.replace(/^translationHash: ".*"$/m, `translationHash: ${JSON.stringify(fingerprint(fields, fixed))}`);
      writeFileSync(file, output);
      files++;
      spans += changed;
    }
  }
  return { files, spans, manual, handEdited };
}

export function checkStructure(DOCS = DEFAULT_DOCS) {
  const languages = readdirSync(DOCS).filter((name) => name !== DEFAULT_LANG && statSync(join(DOCS, name)).isDirectory());
  const pages = [];
  const walk = (dir, base) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path, `${base}${name}/`);
      else if (name.endsWith('.mdx')) pages.push(`${base}${name.replace(/\.mdx$/, '')}`);
    }
  };
  walk(join(DOCS, DEFAULT_LANG), '');

  const problems = [];
  let compared = 0;
  for (const page of pages) {
    const english = structure(parseMdx(readFileSync(join(DOCS, DEFAULT_LANG, `${page}.mdx`), 'utf8')).body);
    for (const lang of languages) {
      const file = join(DOCS, lang, `${page}.mdx`);
      if (!existsSync(file)) continue;
      compared++;
      const found = differences(english, structure(parseMdx(readFileSync(file, 'utf8')).body));
      if (found.length) problems.push({ page, lang, found });
    }
  }
  return { compared, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (process.argv.includes('--fix')) {
    const { files, spans, manual, handEdited } = fixInline();
    console.log(`Restored ${spans} inline code spans to their English value in ${files} files.`);
    if (handEdited.length) console.log(`Left alone, edited by hand: ${handEdited.join(', ')}`);
    if (manual.length) console.log(`Could not align (a span was dropped) — needs a person: ${manual.join(', ')}
`);
  }
  const { compared, problems } = checkStructure();
  for (const { page, lang, found } of problems) {
    console.log(`${lang}/${page}`);
    for (const line of found) console.log(`  ${line}`);
  }
  console.log(`\n${compared} translated pages compared with English: ${problems.length} differ in structure.`);
  process.exit(problems.length ? 1 : 0);
}
