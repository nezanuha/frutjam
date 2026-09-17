/**
 * Tests for the translation tooling: `npm test` (runs in CI before every deploy).
 *
 * Each rule here guards a real failure found while building it — a list
 * dropped from frontmatter, a translation replaced by English, a reordered
 * Japanese sentence "repaired" into the wrong class, a translated table
 * overwritten by sync. Everything runs offline against temporary fixtures with
 * a fake translator; the site's content is only read, never written.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, test } from 'node:test';

import { fingerprint, parseMdx, skeleton, words } from './i18n-hash.mjs';
import { i18nStatus } from './i18n-status.mjs';
import { repairInline } from './i18n-structure.mjs';
import { syncAll, syncBody } from './i18n-sync.mjs';
import { collect, fill, run } from './i18n-translate.mjs';

const REAL_CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');
const FENCE = '```';

const ENGLISH = `---
name: "Demo"
heading: "Demo Component"
description: "A demo component."
metaTitle: "Demo | Frutjam"
metaDescription: "Demo description."
order: 3
related:
  - "components/button"
  - "components/card"
image: "https://cdn.frutjam.com/media/components/demo.webp"
imageAlt: "Demo"
createdAt: "2026-01-01T00:00:00+00:00"
updatedAt: "2026-01-02T00:00:00+00:00"
---

import Snippet from '@/components/Snippet.astro';

A demo component with \`demo-sm\` sizes.

<DocTable wrapper="overflow-y-auto" table="table">

| Class | Type | Description |
| --- | --- | --- |
| demo | <span class="badge badge-xs">Base</span> | The base class |

</DocTable>

| Option | Default | Description |
| --- | --- | --- |
| \`theme\` | inherited | Sets the theme |

<RawHtml html={"<div class=\\"alert\\"><strong>Note.</strong> Use <code>demo-sm</code> here.</div>"} />

## Basic Usage

Use the demo class.

<Snippet>

${FENCE}html
<div class="demo">Hi</div>
${FENCE}

</Snippet>
`;

/** A fake translator: marks every string, so it is obvious what was sent. */
const fake = async (text, target) => `[${target}] ${text}`;
const quiet = { delay: 0, backoff: 0 };

let root;
const page = (lang) => join(root, lang, 'components', 'demo.mdx');
const read = (lang) => readFileSync(page(lang), 'utf8');
const write = (lang, text) => {
  mkdirSync(dirname(page(lang)), { recursive: true });
  writeFileSync(page(lang), text);
};
/** Runs a command while swallowing its console output (not the test reporter's). */
async function silently(fn) {
  const log = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
  }
}
const translate = (args, translator = fake) => silently(() => run(args, { content: root, translate: translator, ...quiet }));
const stateOf = (lang) => i18nStatus(root).rows[0].states[lang];

function freshFixture() {
  root = mkdtempSync(join(tmpdir(), 'frutjam-i18n-'));
  write('en', ENGLISH);
  mkdirSync(join(root, 'de', 'components'), { recursive: true });
}

describe('frontmatter', () => {
  before(freshFixture);
  after(() => rmSync(root, { recursive: true, force: true }));

  test('a written translation keeps lists, numbers and dates', async () => {
    await translate(['--lang', 'de']);
    const { fields } = parseMdx(read('de'));
    assert.deepEqual(fields.related, ['components/button', 'components/card']);
    assert.equal(fields.order, 3);
    assert.equal(fields.updatedAt, '2026-01-02T00:00:00+00:00');
    assert.equal(fields.name, '[de] Demo');
    assert.equal(stateOf('de'), 'current');
  });
});

describe('what gets translated', () => {
  const { template, strings } = collect(parseMdx(ENGLISH).body);

  test('every English page survives a no-op translation byte for byte', () => {
    const walk = (dir) => readdirSync(dir).flatMap((name) =>
      statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]);
    for (const file of walk(join(REAL_CONTENT, 'en'))) {
      const { body } = parseMdx(readFileSync(file, 'utf8'));
      const extracted = collect(body);
      assert.equal(fill(extracted.template, extracted.strings), body, file);
    }
  });

  test('code is never sent to the translator', () => {
    const sent = strings.join('\n');
    assert.doesNotMatch(sent, /demo-sm/);
    assert.doesNotMatch(sent, /<div class="demo">/);
    assert.doesNotMatch(sent, /^demo$/m);
  });

  test('table cells keep their padding', () => {
    const out = fill(template, strings.map((s) => `[de] ${s}`));
    assert.match(out, /^\| \[de\] Class \| \[de\] Type \| \[de\] Description \|$/m);
  });

  test('a dropped marker fails instead of publishing a broken sentence', () => {
    assert.throws(() => fill(template.replace('XSLOT0X', 'XSL0T0X'), strings), /mangled/);
  });

  test('a marker the translator spaced out is still restored', () => {
    assert.equal(fill(template.replace('XSLOT0X', 'XSLOT 0 X'), strings), parseMdx(ENGLISH).body);
  });

  test('callout text is translated; its tags and code are not; the result is valid', () => {
    const out = fill(template, strings.map((s) => `«${s} "q" <b>»`));
    const line = out.split('\n').find((l) => l.startsWith('<RawHtml'));
    const html = JSON.parse(line.slice(line.indexOf('{') + 1, line.lastIndexOf('}')));
    assert.match(html, /^<div class="alert"><strong>«Note\. "q" &lt;b&gt;»<\/strong>/);
    assert.match(html, /<code>demo-sm<\/code>/);
  });

  test('a demo editor keeps its sample content in English', () => {
    const body = '<RawHtml html={"<textarea class=\\"editor\\"># Sample</textarea>"} />';
    assert.equal(collect(body).strings.length, 0);
  });
});

describe('repairing inline code', () => {
  test('invisible characters inside a class name are removed', () => {
    const { body } = repairInline('Use `frutjam/react` here.', 'Hier `frutjam/r​​eact` nutzen.');
    assert.equal(body, 'Hier `frutjam/react` nutzen.');
  });

  test('spans a language reordered are left alone', () => {
    const english = 'Use `createCarousel` from `frutjam/js` or `useCarousel` from `frutjam/react`.';
    const japanese = '`frutjam/js` の `createCarousel` または `frutjam/react` の `useCarousel` を使用します。';
    assert.equal(repairInline(english, japanese).changed, 0);
  });

  test('a translated class name is put back', () => {
    const { body } = repairInline('Add `collapsible-arrow` to the label.', 'Ajoutez `flèche pliable` au libellé.');
    assert.equal(body, 'Ajoutez `collapsible-arrow` au libellé.');
  });

  test('a line showing the backtick key itself is not touched', () => {
    const line = '| `Ctrl` + `` ` `` | Inline-Code umschalten |';
    assert.equal(repairInline('| `Ctrl` + `` ` `` | Toggle inline code |', line).body, line);
  });
});

describe('code sync', () => {
  const englishBody = parseMdx(ENGLISH).body;
  const { template, strings } = collect(englishBody);
  const germanBody = fill(template, strings.map((s) => `[de] ${s}`));

  test('a changed code example reaches the translation; no word changes', () => {
    const edited = englishBody.replace('<div class="demo">', '<div class="demo demo-lg">').replace('| demo |', '| demo-base |');
    const synced = syncBody(edited, germanBody);
    assert.match(synced, /<div class="demo demo-lg">/);
    assert.match(synced, /\| demo-base \|/);
    assert.equal(words(synced), words(germanBody));
  });

  test('callouts are never copied from English', () => {
    const edited = englishBody.replace('Note.', 'Warning.');
    assert.match(syncBody(edited, germanBody), /\[de\] Note\./);
  });

  test('cells of an ordinary table stay translated', () => {
    const spanish = germanBody.replace('| inherited |', '| heredado |');
    assert.match(syncBody(englishBody, spanish), /\| heredado \|/);
    // Its first column too: only a <DocTable> class column is code, and a
    // single lowercase word elsewhere is just a translated word.
    const english = '| Key | Action |\n| --- | --- |\n| enter | Adds a line |';
    const translated = '| Tecla | Acción |\n| --- | --- |\n| intro | Añade una línea |';
    assert.equal(syncBody(english, translated), translated);
  });

  test('when English gains a code block, the translation is not forced to match', () => {
    const added = `${englishBody}\n<Snippet>\n\n${FENCE}html\n<b>new</b>\n${FENCE}\n\n</Snippet>\n`;
    assert.equal(syncBody(added, germanBody), null);
    assert.notEqual(skeleton(added), skeleton(germanBody));
  });
});

describe('fingerprints', () => {
  const { fields, body } = parseMdx(ENGLISH);

  test('changing code does not make translations stale', () => {
    assert.equal(fingerprint(fields, body.replace('<div class="demo">', '<div class="demo x">')), fingerprint(fields, body));
    assert.equal(fingerprint(fields, body.replace('| demo |', '| demo-x |')), fingerprint(fields, body));
  });

  test('changing words does', () => {
    assert.notEqual(fingerprint(fields, body.replace('Use the demo class.', 'Use it.')), fingerprint(fields, body));
    assert.notEqual(fingerprint(fields, body.replace('Note.', 'Warning.')), fingerprint(fields, body));
    assert.notEqual(fingerprint({ ...fields, name: 'Other' }, body), fingerprint(fields, body));
  });
});

describe('npm run i18n:translate never destroys work', () => {
  const changeEnglishWords = () => write('en', read('en').replace('Use the demo class.', 'Use the demo class anywhere.'));

  test('a stale machine translation is rewritten', async () => {
    freshFixture();
    await translate(['--lang', 'de']);
    changeEnglishWords();
    assert.equal(stateOf('de'), 'stale');
    await translate(['--lang', 'de']);
    assert.match(read('de'), /\[de\] Use the demo class anywhere\./);
    assert.equal(stateOf('de'), 'current');
  });

  test('a translation someone edited is never overwritten, even when English changes', async () => {
    freshFixture();
    await translate(['--lang', 'de']);
    write('de', read('de').replace('[de] Use the demo class.', 'Verwende die Demo-Klasse.'));
    changeEnglishWords();
    const handMade = read('de');
    assert.equal(stateOf('de'), 'edited-stale');
    await translate(['--lang', 'de']);
    await translate(['--lang', 'de', '--broken']);
    assert.equal(read('de'), handMade);
  });

  test('a reviewed translation is never overwritten', async () => {
    freshFixture();
    await translate(['--lang', 'de']);
    write('de', read('de').replace('translationHash:', 'reviewed: true\ntranslationHash:'));
    changeEnglishWords();
    const reviewed = read('de');
    await translate(['--lang', 'de']);
    assert.equal(read('de'), reviewed);
  });

  for (const [name, translator] of [
    ['refuses', async () => { throw new Error('HTTP 429'); }],
    ['returns nothing', async () => ''],
    ['returns the English text', async (text) => text],
  ]) {
    test(`nothing is written when the service ${name}`, async () => {
      freshFixture();
      await translate(['--lang', 'de']);
      changeEnglishWords();
      const before = read('de');
      await translate(['--lang', 'de'], translator);
      assert.equal(read('de'), before);
    });
  }

  test('sync on a hand-edited translation changes code only', async () => {
    freshFixture();
    await translate(['--lang', 'de']);
    write('de', read('de').replace('[de] Use the demo class.', 'Verwende die Demo-Klasse.'));
    write('en', read('en').replace('<div class="demo">', '<div class="demo demo-lg">'));
    syncAll(root);
    const german = read('de');
    assert.match(german, /<div class="demo demo-lg">/);
    assert.match(german, /Verwende die Demo-Klasse\./);
    assert.equal(stateOf('de'), 'edited');
  });
});
