/**
 * Re-translates the doc pages whose English source changed.
 *
 *   npm run i18n:translate                       every stale or missing page
 *   npm run i18n:translate -- components/button  one page
 *   npm run i18n:translate -- --lang ja,de       some languages
 *   npm run i18n:translate -- --dry-run          say what would change
 *   npm run i18n:translate -- --check            does the service answer from here?
 *
 * Google Translate, the service the Django site used through deep_translator
 * (which also sent one string per request). No extra dependency: plain fetch,
 * with two spare endpoints if the first is rate-limited. Set
 * GOOGLE_TRANSLATE_API_KEY for the paid Cloud Translation API, or
 * MYMEMORY_EMAIL to raise the MyMemory fallback's daily limit.
 *
 * It only ever writes a page that `npm run i18n:status` calls **missing** or
 * **stale**. A translation someone edited by hand, or marked `reviewed: true`,
 * is skipped and listed at the end: machine output must never overwrite a
 * person's work. Nothing is written when the service fails, so a page keeps its
 * existing translation rather than being replaced by English.
 *
 * Translated: prose, headings, table descriptions, the text inside <RawHtml>
 * callouts, and the frontmatter fields a reader sees. Never translated: code
 * blocks, inline code, class names, component tags, URLs, text inside <code>,
 * <kbd>, <textarea> and similar elements, and frontmatter that is not text.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSLATED_FIELDS, fingerprint, parseMdx } from './i18n-hash.mjs';
import { i18nStatus, isProtected, needsTranslation } from './i18n-status.mjs';
import { checkStructure } from './i18n-structure.mjs';

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(DOCS, 'src', 'content', 'docs');
const DEFAULT_LANG = 'en';

/** settings.GOOGLE_TRANSLATE_LANG_MAP from the Django project. */
const GOOGLE_LANG = {
  ja: 'ja', 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW', ko: 'ko', 'pt-br': 'pt',
  es: 'es', de: 'de', tr: 'tr', pl: 'pl', id: 'id', vi: 'vi', fr: 'fr',
};

const FRONTMATTER_ORDER = [
  'name', 'heading', 'description', 'metaTitle', 'metaDescription', 'order', 'status',
  'related', 'image', 'imageAlt', 'createdAt', 'updatedAt', 'reviewed', 'sourceHash', 'translationHash',
];

const DELAY = 150;
const RETRIES = 3;
const BACKOFF = 5000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class TranslationFailed extends Error {}

// ── Pulling the translatable text out of a page ──────────────────────────────

const CODE_SPLIT = /(`[^`]*`)/;
const LINK = /(\[)([^\]]+)(\]\([^)]*\))/g;
const SPAN = /^(<span[^>]*>)(.*?)(<\/span>)$/;
const SLOT = /XSLOT\s*(\d+)\s*X/gi;
const SKIP_LINE = /^(import |export |<Snippet|<\/Snippet|<DocTable|<\/DocTable|<script)/;
const RAW_HTML = /^(\s*<RawHtml\s+html=\{)("(?:[^"\\]|\\.)*")(\}\s*\/>\s*)$/;
/** Inside these, text is code or sample input (a demo editor's contents): never translated. */
const LITERAL_TAGS = new Set(['code', 'kbd', 'pre', 'script', 'style', 'svg', 'samp', 'var', 'textarea']);

/** A class name or token cell, which must never be translated. */
const isToken = (cell) => {
  const text = cell.trim();
  if (!text || /^:?-{3,}:?$/.test(text)) return true;
  if (text.startsWith('`') && text.endsWith('`')) return true;
  return /^[a-z0-9][\w\-.:/[\]]*$/.test(text);
};

/** Text into pieces: prose to translate, and markup to carry through. */
function pieces(text) {
  const out = [];
  for (const chunk of text.split(CODE_SPLIT)) {
    if (!chunk) continue;
    if (chunk.startsWith('`')) {
      out.push([chunk, false]);
      continue;
    }
    let last = 0;
    for (const match of chunk.matchAll(LINK)) {
      if (match.index > last) out.push([chunk.slice(last, match.index), true]);
      out.push([match[1], false], [match[2], true], [match[3], false]);
      last = match.index + match[0].length;
    }
    if (last < chunk.length) out.push([chunk.slice(last), true]);
  }
  return out;
}

/** The page with every translatable run replaced by a marker, plus those runs. */
export function collect(body) {
  const strings = [];
  // The marker style Django's translate_po used: carried through untouched.
  const slot = (text) => `XSLOT${strings.push(text) - 1}X`;
  // The surrounding spaces stay put: translators trim, and a table row would
  // lose its padding ("|Klasse|Typ|" instead of "| Klasse | Typ |").
  const prose = (text) =>
    pieces(text)
      .map(([piece, translatable]) => {
        if (!translatable || !piece.trim() || !/[A-Za-z]/.test(piece)) return piece;
        const [, lead, core, trail] = piece.match(/^(\s*)([\s\S]*?)(\s*)$/);
        return `${lead}${slot(core)}${trail}`;
      })
      .join('');

  const lines = [];
  let fence = '';
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (fence) {
      lines.push(line);
      if (trimmed.startsWith(fence)) fence = '';
      continue;
    }
    if (trimmed.startsWith('```')) {
      fence = trimmed.match(/^`+/)[0];
      lines.push(line);
      continue;
    }
    // A <RawHtml> callout holds translated text inside markup: translate its
    // text nodes, keep every tag and anything inside code-like elements.
    const raw = line.match(RAW_HTML);
    if (raw) {
      const html = JSON.parse(raw[2]);
      let literal = 0;
      const translatedHtml = html
        .split(/(<[^>]+>)/)
        .map((part) => {
          const tag = part.match(/^<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>$/);
          if (tag) {
            if (LITERAL_TAGS.has(tag[2].toLowerCase()) && !tag[3]) literal += tag[1] ? -1 : 1;
            return part;
          }
          if (literal > 0 || !part.trim() || !/[A-Za-z]/.test(part)) return part;
          const [, lead, core, trail] = part.match(/^(\s*)([\s\S]*?)(\s*)$/);
          return `${lead}${slot(core)}${trail}`;
        })
        .join('');
      lines.push(`${raw[1]}${JSON.stringify(translatedHtml)}${raw[3]}`);
      continue;
    }
    if (!trimmed || SKIP_LINE.test(trimmed)) {
      lines.push(line);
      continue;
    }
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      lines.push(
        line.split('|').map((cell) => {
          if (!cell.trim() || isToken(cell)) return cell;
          const span = cell.trim().match(SPAN);
          if (!span) return prose(cell);
          // A badge: the label is prose, the markup is not.
          const lead = cell.slice(0, cell.length - cell.trimStart().length);
          const trail = cell.slice(cell.trimEnd().length);
          return `${lead}${span[1]}${slot(span[2])}${span[3]}${trail}`;
        }).join('|')
      );
      continue;
    }
    const heading = line.match(/^(#{1,6} +)(.*)$/);
    if (heading) {
      lines.push(heading[1] + prose(heading[2]));
      continue;
    }
    lines.push(trimmed.startsWith('<') ? line : prose(line));
  }
  return { template: lines.join('\n'), strings };
}

/**
 * Puts translated text back. Every marker must return exactly once: a page
 * publishing with "XSLOT3X" mid-sentence is worse than no translation.
 */
export function fill(template, translated) {
  const seen = new Set();
  const restore = (escape) => (match, index) => {
    seen.add(Number(index));
    const text = translated[Number(index)];
    return text === undefined ? match : escape(text);
  };
  // Inside a <RawHtml> line the text sits in HTML inside a JS string, so it is
  // escaped for both; everywhere else it goes in as written.
  const inRawHtml = (text) => JSON.stringify(text.replace(/</g, '&lt;').replace(/>/g, '&gt;')).slice(1, -1);
  const filled = template
    .split('\n')
    .map((line) => line.replace(SLOT, restore(/^\s*<RawHtml\b/.test(line) ? inRawHtml : (text) => text)))
    .join('\n');
  if (seen.size !== translated.length || /XSLOT/i.test(filled)) {
    throw new TranslationFailed(`the translator mangled the text markers (${seen.size} of ${translated.length} came back)`);
  }
  return filled;
}

export function renderFrontmatter(fields) {
  const lines = ['---'];
  for (const key of FRONTMATTER_ORDER) {
    const value = fields[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (!value.length) lines.push(`${key}: []`);
      else {
        lines.push(`${key}:`);
        for (const item of value) lines.push(`  - ${JSON.stringify(item)}`);
      }
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ── Google Translate ─────────────────────────────────────────────────────────

/**
 * Google Translate, the service the Django site used. Three ways in, tried in
 * order: the endpoint Chrome's dictionary uses, the one deep_translator used
 * (rate-limits by IP and is often refused), and MyMemory as a last resort.
 * Set GOOGLE_TRANSLATE_API_KEY to use the paid Cloud Translation API instead.
 */
const PROVIDERS = [
  {
    name: 'google',
    url: (text, target) =>
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`,
    read: (data) => (Array.isArray(data) ? (typeof data[0] === 'string' ? data[0] : data[0]?.[0]) : ''),
  },
  {
    name: 'google-gtx',
    url: (text, target) =>
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`,
    read: (data) => (data?.[0] ?? []).map((part) => part?.[0] ?? '').join(''),
  },
  {
    name: 'mymemory',
    url: (text, target) =>
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(target)}`
      + (process.env.MYMEMORY_EMAIL ? `&de=${encodeURIComponent(process.env.MYMEMORY_EMAIL)}` : ''),
    read: (data) => data?.responseData?.translatedText ?? '',
  },
];

if (process.env.GOOGLE_TRANSLATE_API_KEY) {
  PROVIDERS.unshift({
    name: 'google-cloud',
    url: (text, target) =>
      'https://translation.googleapis.com/language/translate/v2'
      + `?key=${encodeURIComponent(process.env.GOOGLE_TRANSLATE_API_KEY)}`
      + `&source=en&target=${encodeURIComponent(target)}&format=text&q=${encodeURIComponent(text)}`,
    read: (data) => data?.data?.translations?.[0]?.translatedText ?? '',
  });
}

/** The provider that answered last, so the rest are not retried every string. */
let preferred = 0;

async function fetchFrom(provider, text, target) {
  const response = await fetch(provider.url(text, target), { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const translated = provider.read(await response.json());
  if (!translated || !translated.trim()) throw new Error('empty response');
  return translated;
}

/** One string. Falls back through the providers; throws only if all refuse. */
async function translateOne(text, target) {
  const order = [...PROVIDERS.slice(preferred), ...PROVIDERS.slice(0, preferred)];
  let lastError;
  for (const provider of order) {
    try {
      const translated = await fetchFrom(provider, text, target);
      const index = PROVIDERS.indexOf(provider);
      if (index !== preferred) {
        console.log(`    using ${provider.name}`);
        preferred = index;
      }
      return translated;
    } catch (error) {
      lastError = new Error(`${provider.name}: ${error.message}`);
    }
  }
  throw lastError;
}

/** Every string translated, or an exception: never a partial page. */
async function translateAll(strings, target, { translate = translateOne, delay = DELAY, backoff = BACKOFF } = {}) {
  const cache = new Map();
  const out = [];
  for (const text of strings) {
    if (cache.has(text)) {
      out.push(cache.get(text));
      continue;
    }
    let result;
    let lastError;
    for (let attempt = 0; attempt < RETRIES; attempt++) {
      try {
        const answer = await translate(text, target);
        // An empty answer is a failure, whichever service gave it: writing it
        // would blank a sentence on the page.
        if (typeof answer !== 'string' || !answer.trim()) throw new Error('empty translation');
        result = answer;
        break;
      } catch (error) {
        lastError = error;
        const wait = backoff * (attempt + 1);
        console.log(`    ${target}: refused (${String(error.message).slice(0, 60)}); waiting ${wait / 1000}s`);
        await sleep(wait);
      }
    }
    if (result === undefined) throw new TranslationFailed(String(lastError?.message ?? 'no response'));
    cache.set(text, result);
    out.push(result);
    await sleep(delay);
  }
  return out;
}

// ── Run ──────────────────────────────────────────────────────────────────────

/**
 * The command, as a function: tests pass their own content folder, a fake
 * translator and zero delays, so every safety rule can be checked offline.
 */
export async function run(args, { content = CONTENT, translate = translateOne, delay = DELAY, backoff = BACKOFF } = {}) {
  const service = { translate, delay, backoff };
  if (args.includes('--check')) {
    // Does the service answer from this machine at all? Google's free endpoint
    // rate-limits by IP address, so this is the first thing to try.
    const phrase = 'Badge components are small, compact labels.';
    try {
      console.log(`en: ${phrase}`);
      console.log(`de: ${await translate(phrase, 'de')}`);
      console.log('\nThe translation service answers from here.');
      return 0;
    } catch (error) {
      console.log(`\nThe translation service refused: ${error.message}`);
      console.log('Google rate-limits by IP address. Try again later, from another network,');
      console.log('or switch translateOne() to the paid Cloud Translation API.');
      return 1;
    }
  }
  const dryRun = args.includes('--dry-run');
  const langArg = args.find((a) => a.startsWith('--lang='))
    ?? (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : undefined);
  const pageArgs = args.filter((a) => !a.startsWith('--') && a !== langArg);

  const { languages, rows } = i18nStatus(content);
  const wanted = languages.filter((lang) => !langArg || langArg.split(',').includes(lang));
  const broken = new Set(
    args.includes('--broken') ? checkStructure(content).problems.map((p) => `${p.lang}/${p.page}`) : []
  );
  const held = [];
  const failed = [];
  const considered = [];
  let written = 0;

  for (const row of rows) {
    if (pageArgs.length && !pageArgs.includes(row.page)) continue;
    // --broken: also machine-made pages whose text damaged the code inside it
    // (npm run i18n:check). Never one a person edited or reviewed.
    const todo = wanted.filter((lang) =>
      needsTranslation(row.states[lang])
      || (broken.has(`${lang}/${row.page}`) && row.states[lang] === 'current'));
    held.push(...wanted.filter((lang) => isProtected(row.states[lang])).map((lang) => `${row.page} [${lang}] ${row.states[lang]}`));
    if (!todo.length) continue;
    considered.push(row.page);

    const source = readFileSync(join(content, DEFAULT_LANG, `${row.page}.mdx`), 'utf8');
    const { fields, body } = parseMdx(source);
    const { template, strings } = collect(body);
    const fieldValues = TRANSLATED_FIELDS.map((field) => fields[field] ?? '');
    console.log(`${row.page}: ${strings.length} strings × ${todo.length} languages (${todo.join(', ')})`);

    for (const lang of todo) {
      const target = GOOGLE_LANG[lang];
      if (dryRun) {
        console.log(`  ${lang}: would write ${join(content, lang, `${row.page}.mdx`)}`);
        continue;
      }
      let translatedFields;
      let newBody;
      try {
        translatedFields = await translateAll(fieldValues.filter(Boolean), target, service);
        newBody = fill(template, await translateAll(strings, target, service));
      } catch (error) {
        // The file stays exactly as it is: stale or missing beats overwritten.
        console.log(`  ${lang}: SKIPPED, nothing written — ${error.message}`);
        failed.push(`${row.page} [${lang}]`);
        continue;
      }

      const values = translatedFields[Symbol.iterator]();
      const newFields = { ...fields };
      for (const [i, field] of TRANSLATED_FIELDS.entries()) {
        if (fieldValues[i]) newFields[field] = values.next().value;
      }
      if (strings.length && newBody.trim() === body.trim()) {
        console.log(`  ${lang}: SKIPPED, nothing written — the service returned the English text`);
        failed.push(`${row.page} [${lang}]`);
        continue;
      }

      newFields.sourceHash = row.sourceHash;
      newFields.translationHash = fingerprint(newFields, newBody);
      const path = join(content, lang, `${row.page}.mdx`);
      if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `${renderFrontmatter(newFields)}\n\n${newBody.replace(/^\n+/, '')}`);
      console.log(`  ${lang}: written`);
      written++;
    }
  }

    const unknown = pageArgs.filter((page) => !rows.some((row) => row.page === page));
  for (const page of unknown) console.log(`${page}: no such page under src/content/docs/${DEFAULT_LANG}/`);
  // Nothing was written: say why, unless the only reason was a misspelt page.
  if (!written && !failed.length && !considered.length && unknown.length < Math.max(pageArgs.length, 1)) {
    const scope = [pageArgs.join(', '), langArg && `[${langArg}]`].filter(Boolean).join(' ') || 'every page';
    console.log(`Nothing to do: ${scope} is already translated and up to date.`);
    console.log('`npm run i18n:status` lists what is waiting; only stale or missing pages are written.');
  }

if (held.length) {
    console.log(`\nLeft alone (${held.length}) — edited or reviewed by a person:`);
    for (const item of [...new Set(held)].sort()) console.log(`  ${item}`);
  }
  if (failed.length) {
    console.log(`\n${failed.length} left unchanged because the service failed — run again later:`);
    for (const item of failed) console.log(`  ${item}`);
  }
  if (written) {
    console.log(`\n${written} files written. Read the diff before committing: this is machine translation.`);
  }
  return failed.length && !written ? 1 : 0;
}

// Importable for tests; runs only when invoked as a command.
const invokedDirectly = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invokedDirectly) {
  process.exit(await run(process.argv.slice(2)));
}
