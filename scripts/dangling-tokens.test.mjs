/**
 * Every custom property a built stylesheet reads has to come from somewhere.
 *
 * The standalone CSS entry points carry no Tailwind theme, so a component that
 * sizes itself with a Tailwind token resolves to nothing there and the whole
 * declaration is dropped. That is how `progress` shipped in 2.3.0 with no
 * height at all, along with `drawer`, `footer`, `hero` and `sidebar`: they read
 * `--spacing`, which only exists once Tailwind's theme is loaded.
 *
 * A token is fine if the file defines it, if the file it sits beside defines
 * it, or if the reference carries its own fallback. Anything else is a token
 * that is empty for whoever imports that file.
 *
 * Run: npm test   (after npm run build)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** `var(--x)` and `var(--x, fallback)`; the second group is the fallback. */
const READS = /var\(\s*(--[\w-]+)\s*([,)])/g;
const DEFINES = /(--[\w-]+)\s*:/g;

const matches = (css, re) => new Set([...css.matchAll(re)].map((m) => m[1]));

/**
 * Hooks we read on purpose and never set, so an author can. Empty is the
 * correct value for these until someone supplies one, which is why they are
 * allowed to dangle. Anything not on this list is a token that silently
 * resolves to nothing for whoever imports the file.
 */
const AUTHOR_HOOKS = new Set([
  '--alert--height',
  '--alert--outline-color',
  '--alert--outline-style',
  '--alert--outline-width',
  '--badge--outline-color',
  '--badge--outline-style',
  '--badge--outline-width',
  '--radio--box-shadow',
]);

/** Tokens read with no fallback of their own. */
function readsWithoutFallback(css) {
  const out = new Set();
  for (const m of css.matchAll(READS)) if (m[2] === ')') out.add(m[1]);
  return out;
}

/** The CSS a consumer gets, and what each one may rely on alongside it. */
function entryPoints() {
  const points = [
    // `frutjam/css` is imported on its own, so it has to be self-contained.
    { file: 'frutjam.components.css', alongside: [] },
    // `frutjam/css/full` carries Tailwind's own output, theme included.
    { file: 'frutjam.min.css', alongside: [] },
    { file: 'base.css', alongside: [] },
  ];
  // A single component is imported next to the base layer, never alone.
  const dir = join(DIST, 'components');
  if (existsSync(dir)) {
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
      points.push({ file: join('components', name), alongside: ['base.css'] });
    }
  }
  return points;
}

test('no built stylesheet reads a custom property nothing defines', () => {
  const points = entryPoints();
  assert.ok(points.length > 5, 'dist looks empty — run npm run build first');

  const broken = [];
  for (const { file, alongside } of points) {
    const path = join(DIST, file);
    if (!existsSync(path)) continue;
    const css = readFileSync(path, 'utf8');

    const defined = matches(css, DEFINES);
    for (const other of alongside) {
      const p = join(DIST, other);
      if (existsSync(p)) for (const t of matches(readFileSync(p, 'utf8'), DEFINES)) defined.add(t);
    }

    for (const token of readsWithoutFallback(css)) {
      if (defined.has(token) || AUTHOR_HOOKS.has(token)) continue;
      broken.push(`${file} reads ${token}, and nothing defines it`);
    }
  }

  assert.deepEqual(broken, [], `\n  ${broken.join('\n  ')}\n`);
});
