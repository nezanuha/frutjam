/**
 * Fingerprints and page structure for translated pages, shared by the build,
 * the status report, the translation script and the code sync.
 *
 * A translated page records two fingerprints in its frontmatter:
 *
 *   sourceHash       the English page it was translated from. Differs from the
 *                    English page's current fingerprint → the translation is
 *                    stale.
 *   translationHash  this file as it was written. Differs from the file's own
 *                    fingerprint → somebody edited the translation by hand, so
 *                    no script may overwrite its words.
 *
 * Both cover the **words** only. Code blocks, component tags, class names and
 * badge markup are the same in every language and are copied from English by
 * `npm run i18n:sync`, so changing a code example never makes a translation
 * stale, and syncing code never makes a page look hand-edited.
 */
import { createHash } from 'node:crypto';

/** The fields a reader sees; a change to any of them needs re-translating. */
export const TRANSLATED_FIELDS = ['name', 'heading', 'description', 'metaTitle', 'metaDescription', 'imageAlt'];

// <RawHtml> is not listed: its markup carries translated text (callout boxes),
// so it counts as words — never copied from English, part of the fingerprint.
const COMPONENT_LINE = /^(import |export |<\/?(Snippet|DocTable|ThemeCards)\b)/;
const TABLE_SEPARATOR = /^\|[\s:|-]+\|$/;
const CLASS_TOKEN = /^[a-z0-9][\w\-.:/[\]]*$/;

/**
 * A page body as a sequence of segments:
 *   fence      a fenced code block, opening to closing line
 *   component  an import, <Snippet>, <DocTable>, <ThemeCards> line
 *   table      a table row (separator rows included)
 *   text       everything a translator translates: prose, headings, blank
 *              lines, and <RawHtml> callouts (their markup holds text)
 */
export function segments(body) {
  const out = [];
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  // Rows inside <DocTable> are a component's class reference: their first
  // column is a class name. Every other table (options, shortcuts) is words.
  let classTable = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const fence = trimmed.match(/^(`{3,})/);
    if (fence) {
      const start = i;
      for (i++; i < lines.length && !lines[i].trim().startsWith(fence[1]); i++);
      out.push({ type: 'fence', text: lines.slice(start, i + 1).join('\n') });
    } else if (COMPONENT_LINE.test(trimmed)) {
      if (/^<DocTable\b/.test(trimmed)) classTable = true;
      if (/^<\/DocTable>/.test(trimmed)) classTable = false;
      out.push({ type: 'component', text: lines[i] });
    } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      out.push({ type: 'table', text: lines[i], classTable });
    } else {
      out.push({ type: 'text', text: lines[i] });
    }
  }
  return out;
}

/** The code-and-markup skeleton: what must line up for code to be synced. */
export const skeleton = (body) =>
  segments(body).filter((s) => s.type !== 'text').map((s) => (s.type === 'table' ? `table:${cells(s.text).length}` : s.type)).join(',');

const cells = (row) => row.trim().slice(1, -1).split('|');

/** A table row with its code taken out: class cells dropped, badge tags bare. */
function tableWords(row, classTable) {
  if (TABLE_SEPARATOR.test(row.trim())) return '';
  if (!classTable) return row.trim();
  return cells(row)
    .map((cell) => cell.trim())
    .filter((cell, i) => !(i === 0 && CLASS_TOKEN.test(cell)))
    .map((cell) => cell.replace(/<span\b[^>]*>/g, '<span>'))
    .join('|');
}

/** Just the words of a page body. */
export function words(body) {
  return segments(body)
    .filter((s) => s.type === 'text' || s.type === 'table')
    .map((s) => (s.type === 'table' ? tableWords(s.text, s.classTable) : s.text))
    .join('\n')
    .trim();
}

export function fingerprint(fields, body) {
  const hash = createHash('sha256');
  for (const field of TRANSLATED_FIELDS) hash.update(`${fields[field] ?? ''}\n`);
  hash.update(words(body));
  return hash.digest('hex').slice(0, 12);
}

/**
 * Splits an MDX page into frontmatter fields and body.
 *
 * Enough YAML for the frontmatter these pages use: quoted strings, numbers,
 * booleans, and lists of quoted strings (`related`). Everything must survive
 * the round trip — a dropped list means a page written back without its
 * related links.
 */
export function parseMdx(source) {
  const text = source.replace(/\r\n?/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { fields: {}, body: text };

  const scalar = (raw) => {
    if (raw.startsWith('"')) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    if (raw === 'true' || raw === 'false') return raw === 'true';
    if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
    return raw;
  };

  const fields = {};
  let listKey = null;
  for (const line of match[1].split('\n')) {
    const item = line.match(/^ {2}- (.*)$/);
    if (item && listKey) {
      fields[listKey].push(scalar(item[1]));
      continue;
    }
    const field = line.match(/^(\w+):(?: (.*))?$/);
    if (!field) continue;
    const [, key, raw] = field;
    listKey = null;
    if (raw === undefined || raw === '') {
      // A list follows on the next lines.
      fields[key] = [];
      listKey = key;
    } else if (raw === '[]') {
      fields[key] = [];
    } else {
      fields[key] = scalar(raw);
    }
  }
  return { fields, body: match[2] };
}

export const fingerprintFile = (source) => {
  const { fields, body } = parseMdx(source);
  return fingerprint(fields, body);
};
