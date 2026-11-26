/**
 * A component nobody uses should contribute nothing.
 *
 * `@utility` bodies go through Tailwind's usage scan, so they only appear when
 * something in the source writes the class. A top-level at-rule beside one
 * does not: there is no class for Tailwind to key it on, so it is emitted into
 * every project.
 *
 * That is how countdown's 3-digit strip shipped everywhere -- 5.9 kB of
 * literal 000-999 content, in a rule that could never match, because the span
 * it styles has to sit inside a container only `.countdown` names. Moving it
 * inside the utility fixed it; this is what says so.
 *
 * Compiles rather than reading dist/, because tree-shaking is the thing under
 * test and dist/ is the build with everything in it.
 *
 * A modifier written `:where(&) :where(x)` had the same problem for a second
 * reason. It compiles to the key `:where(.table-hover) :where(tbody tr)`, which
 * leads with a class without starting with one, so splitStyles sent it to
 * addBase -- where it was emitted unconditionally and never received the
 * prefix the consumer applies to utility names. Under `prefix(fj)` the rule
 * asked for `.me-table-hover` while the markup said `fj:me-table-hover`, so
 * table-hover, the zebras, the pins and the five sizes all did nothing.
 *
 * The six `@keyframes` blocks still leak, for about 0.4 kB in total. An
 * at-rule cannot be nested in a utility and still be referenced by name, so
 * the fix there is a move to animation tokens. Left, and written down here so
 * the next person knows it is known.
 *
 * Run: npm test   (after npm run build)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const BACKSLASH = String.fromCharCode(92);
const forward = (path) => path.split(BACKSLASH).join('/');

/**
 * Compile a one-file project whose markup is exactly `markup`.
 *
 * `imports` is how Tailwind itself is brought in, which is the difference
 * between the two helpers below: a consumer may give Tailwind a prefix of its
 * own, and that is the case where an addBase rule stops matching anything.
 */
async function build(markup, imports, pluginOptions = '') {
    const dir = mkdtempSync(join(tmpdir(), 'frutjam-treeshake-'));
    const html = join(dir, 'index.html');
    writeFileSync(html, markup);
    try {
        const css = [
            ...imports,
            '@source "' + forward(html) + '";',
            '@plugin "./dist/plugin.js"' + pluginOptions + ';',
            '',
        ].join('\n');
        // `from` has to sit in the project, or `tailwindcss` and the plugin
        // cannot be resolved from the temporary directory.
        const out = await postcss([tailwind()]).process(css, { from: './unused-components.css' });
        return out.css;
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

const compile = (markup) => build(markup, ['@import "tailwindcss" source(none);']);

const compilePrefixed = (markup) => build(markup, [
    '@import "tailwindcss/theme" prefix(fj);',
    '@import "tailwindcss/utilities" prefix(fj) source(none);',
], ' { prefix: me; }');

const BUILT = new URL('../dist/plugin.js', import.meta.url);

test('countdown contributes nothing to a project that does not use it', async (t) => {
    if (!existsSync(BUILT)) {
        t.skip('run npm run build first');
        return;
    }

    const css = await compile('<div class="btn">hello</div>');

    assert.ok(!css.includes('container: countdown'),
        'the countdown utility itself leaked into a project without one');
    assert.ok(!css.includes('@container countdown style'),
        'countdown\'s 3-digit container query leaked: it belongs inside @utility '
        + 'countdown, or it is emitted unconditionally');
    assert.ok(!css.includes('000' + BACKSLASH + 'A 001'),
        'countdown\'s 3-digit content strip leaked, which is 5.8 kB of it');
});

test('countdown is whole in a project that does use it', async (t) => {
    if (!existsSync(BUILT)) {
        t.skip('run npm run build first');
        return;
    }

    const css = await compile('<div class="countdown"><span></span></div>');

    assert.ok(css.includes('container: countdown'), 'the utility is missing');
    assert.ok(css.includes('00' + BACKSLASH + 'A 01'), 'the 2-digit default is missing');
    assert.ok(css.includes('@container countdown style'),
        'the 3-digit container query is missing, so --digits: 3 does nothing');

    // The override has to come after the default, since the two resolve to the
    // same selector and the same specificity.
    assert.ok(css.indexOf('content: "000') > css.indexOf('content: "00' + BACKSLASH + 'A'),
        'the 3-digit strip comes before the 2-digit default, so it cannot win');
});

test('a modifier is attached to its class, not to the base layer', async (t) => {
    if (!existsSync(BUILT)) {
        t.skip('run npm run build first');
        return;
    }

    const css = await compile('<div class="btn">hello</div>');

    for (const name of [
        'table-hover', 'table-zebra', 'table-zebra-rows', 'table-zebra-cols',
        'table-pin-rows', 'table-pin-cols', 'table-xs', 'table-sm', 'table-md',
        'table-lg', 'table-xl', 'swap-rotate', 'drawer-content',
    ]) {
        assert.ok(!css.includes(name),
            name + " leaked into a project that does not use it: its rule leads "
            + "with the class without starting with it, so splitStyles sent it to "
            + "addBase");
    }
});

test('a modifier carries the prefix the consumer asked for', async (t) => {
    if (!existsSync(BUILT)) {
        t.skip('run npm run build first');
        return;
    }

    // The class in the markup is fj:me-table-hover, so the selector has to be
    // .fj\\:me-table-hover. An addBase rule never gets that prefix, which is
    // how these modifiers came to do nothing at all in a prefixed build.
    const css = await compilePrefixed('<table class="fj:me-table fj:me-table-hover"></table>');

    assert.ok(css.includes('\\:me-table-hover'),
        'the rule is not prefixed, so it cannot match the class in the markup');
    assert.ok(!css.includes(':where(.me-table-hover)'),
        'the unprefixed rule is still there, and it matches nothing');
});
