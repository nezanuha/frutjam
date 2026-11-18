/**
 * A component that repaints its children has to exclude the children that
 * already chose a colour, and it does that by naming them one by one:
 *
 *   .alert :where(.btn):not(.btn-primary, .btn-secondary, …)
 *
 * That list is a copy of the colour utilities another component defines, kept
 * by hand. Add a ninth colour to the button and the alert starts overriding it,
 * silently, and the only symptom is a button that comes out the wrong colour
 * inside an alert. This asserts the two lists still agree.
 *
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src/components/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** Every stylesheet a component is built from, concatenated. */
function source(component) {
  const dir = join(SRC, component);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
}

/** The colour utilities a component declares, e.g. btn-primary → primary. */
function colorsOf(component, palette) {
  const names = [...source(component).matchAll(new RegExp(`@utility ${component === 'button' ? 'btn' : component}-([a-z]+)\\s`, 'g'))];
  return new Set(names.map((m) => m[1]).filter((n) => palette.has(n)));
}

/** The names inside every :not(…) exclusion list in a component. */
function excludedBy(component, prefix) {
  const out = new Set();
  for (const m of source(component).matchAll(/:not\(([^)]*)\)/g)) {
    for (const n of m[1].matchAll(new RegExp(`\\.${prefix}-([a-z]+)`, 'g'))) out.add(n[1]);
  }
  return out;
}

// The semantic palette, as the theme defines it.
const PALETTE = new Set([
  'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error',
]);

test('alert excludes exactly the buttons that choose their own colour', () => {
  const colors = colorsOf('button', PALETTE);
  const excluded = excludedBy('alert', 'btn');

  assert.ok(colors.size >= 8, `expected the button to define colour utilities, found ${colors.size}`);

  const missing = [...colors].filter((c) => !excluded.has(c)).sort();
  const extra = [...excluded].filter((c) => !colors.has(c)).sort();

  assert.deepEqual(
    { missing, extra },
    { missing: [], extra: [] },
    `\n  alert would repaint btn-${missing.join(', btn-')}` +
      (extra.length ? `\n  alert excludes btn-${extra.join(', btn-')}, which no longer exists` : '') +
      '\n  update the :not(…) list in src/components/alert/base.css\n',
  );
});
