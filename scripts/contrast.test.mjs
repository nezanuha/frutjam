/**
 * Every variant's label has to be readable on the surface it sits on.
 *
 * `tag-soft` and `tag-outline` drew their label in a surface color for eight
 * months, across nine releases, because nothing checked. The two tests beside
 * this one would not have caught it: the token existed and resolved, it was
 * simply the wrong one. The only thing that catches a color being legal and
 * unreadable is measuring the contrast.
 *
 * Why a browser: the themes are built from `oklch()`, `color-mix()` and
 * `light-dark()`, resolved through a cascade of custom properties. Nothing
 * short of a rendering engine will tell you what a label actually comes out
 * as, so this loads the built stylesheet in headless Chrome and reads back
 * `getComputedStyle`. With no Chrome to be found the test skips rather than
 * fails, so a contributor without one is not blocked.
 *
 * The bar is WCAG AA: 4.5:1 for normal text. KNOWN is for variants that fail
 * today — it keeps the test honest about what is broken while still failing
 * the build on anything newly broken. Entries should be deleted, not added.
 *
 * Run: npm test   (after npm run build)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const CSS = join(ROOT, 'dist', 'frutjam.min.css');

/** The themes a consumer can set, light and dark of each family. */
const THEMES = ['light', 'dark', 'snowberry', 'darkberry'];

/** The semantic palette, plus the colourless default every component has. */
const COLORS = ['', 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];

/**
 * The components whose job is to show a label, and the style variants that
 * repaint them. `''` is the component with no style modifier at all, which is
 * the case `tag-soft` broke.
 */
const COMPONENTS = [
  { base: 'tag', tag: 'span', styles: ['', 'soft', 'outline'] },
  { base: 'badge', tag: 'span', styles: ['', 'soft', 'outline', 'dashed', 'ghost'] },
  { base: 'btn', tag: 'button', styles: ['', 'soft', 'outline', 'dashed', 'ghost'] },
  { base: 'alert', tag: 'div', styles: ['', 'soft', 'outline', 'dashed', 'ghost'] },
];

/**
 * Variants that do not meet AA today. Each one is a bug that predates this
 * test; the list exists so the test can be switched on without a flag day,
 * and every line in it is a thing to fix. Never add to it to make a build
 * pass — a new entry means a variant just became unreadable.
 */
const KNOWN = new Set([]);

const WCAG_AA_NORMAL_TEXT = 4.5;

/** A free port, so two runs on one machine do not collide. */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

/** The page under test: every component, in every style, in every colour. */
function buildPage(theme) {
  const cells = [];
  for (const { base, tag, styles } of COMPONENTS) {
    for (const style of styles) {
      for (const color of COLORS) {
        const classes = [base, style && `${base}-${style}`, color && `${base}-${color}`].filter(Boolean);
        const id = [base, style || 'plain', color || 'default'].join('.');
        // The alert keeps its label in a child, as its markup requires.
        const inner = base === 'alert' ? '<span class="alert-content">Label text</span>' : 'Label text';
        cells.push(`<${tag} class="${classes.join(' ')}" data-probe="${id}">${inner}</${tag}>`);
      }
    }
  }
  return `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">
<link rel="stylesheet" href="frutjam.min.css"></head>
<body><div style="padding:16px">${cells.join('\n')}</div></body></html>`;
}

/**
 * Measured inside the page: the label's colour against whatever is actually
 * behind it. A transparent background is not white — it is whatever the
 * ancestors composite to, which is why this walks up rather than reading one
 * element and guessing.
 */
const MEASURE = `(() => {
  /**
   * Computed colours come back in whatever space the author wrote, and this
   * theme is written in oklch -- getComputedStyle hands back
   * "oklch(0.1 0.01 30)", not rgb. Pulling three numbers out of that and
   * calling them red, green and blue is nonsense, so let the canvas do the
   * conversion: it resolves any CSS colour, oklch and color-mix included,
   * and getImageData gives the sRGB bytes a human would actually see.
   */
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const parse = (c) => {
    if (!c) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;              // an unparseable value leaves it at #000
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    // getImageData is premultiplied; undo it so compositing is done once, by us.
    const alpha = a / 255;
    return alpha === 0
      ? { r: 0, g: 0, b: 0, a: 0 }
      : { r: r / alpha, g: g / alpha, b: b / alpha, a: alpha };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Composite every ancestor background down to an opaque colour. */
  const backdrop = (el) => {
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    const stack = [];
    for (let n = el; n; n = n.parentElement) stack.push(parse(getComputedStyle(n).backgroundColor) ?? { r: 0, g: 0, b: 0, a: 0 });
    const page = parse(getComputedStyle(document.documentElement).backgroundColor);
    if (page && page.a === 1) acc = page;
    // documentElement is in the stack too, so the seed above is only the
    // canvas the page itself is painted on.
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].a > 0) acc = over(stack[i], acc);
    return acc;
  };
  const out = [];
  for (const el of document.querySelectorAll('[data-probe]')) {
    const target = el.querySelector('.alert-content') ?? el;
    const fg = parse(getComputedStyle(target).color);
    if (!fg) continue;
    const bg = backdrop(el);
    out.push({ probe: el.dataset.probe, ratio: +ratio(over(fg, bg), bg).toFixed(2) });
  }
  return JSON.stringify(out);
})()`;

/** Minimal CDP client: open a tab, point it at a file, evaluate, read back. */
async function measure(chrome, dir, theme, port) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Page.navigate', { url: `file:///${join(dir, `${theme}.html`).replace(/\\/g, '/')}` });
  await new Promise((r) => setTimeout(r, 600));
  const { result } = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
  ws.close();
  return JSON.parse(result.value);
}

test('every variant label meets WCAG AA on its own background', { timeout: 120000 }, async (t) => {
  if (!existsSync(CSS)) {
    t.skip('dist/frutjam.min.css is missing — run npm run build first');
    return;
  }
  const chrome = findChrome();
  if (!chrome) {
    t.skip('no Chrome found — set CHROME_PATH to run the contrast check');
    return;
  }

  const dir = mkdtempSync(join(tmpdir(), 'frutjam-contrast-'));
  const port = await freePort();
  let proc;
  try {
    writeFileSync(join(dir, 'frutjam.min.css'), (await import('node:fs')).readFileSync(CSS));
    for (const theme of THEMES) writeFileSync(join(dir, `${theme}.html`), buildPage(theme));

    proc = spawn(chrome, [
      '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      `--remote-debugging-port=${port}`, `--user-data-dir=${join(dir, 'profile')}`,
      '--allow-file-access-from-files', 'about:blank',
    ], { stdio: 'ignore' });

    // Wait for the debugging endpoint rather than sleeping a fixed amount.
    for (let i = 0; i < 60; i++) {
      try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await new Promise((r) => setTimeout(r, 250)); }
    }

    const failures = [];
    for (const theme of THEMES) {
      for (const { probe, ratio } of await measure(chrome, dir, theme, port)) {
        const key = `${theme} ${probe}`;
        if (ratio >= WCAG_AA_NORMAL_TEXT || KNOWN.has(key)) continue;
        failures.push(`${key} — ${ratio}:1`);
      }
    }

    assert.deepEqual(
      failures.sort(),
      [],
      `\n  ${failures.length} variant(s) below ${WCAG_AA_NORMAL_TEXT}:1\n\n  ` +
        failures.sort().join('\n  ') +
        '\n\n  A label drawn in a surface color is the usual cause.\n',
    );
  } finally {
    // Best effort, and never fatal. Windows keeps a lock on the browser
    // profile for a moment after the process dies, and a temp directory that
    // outlives the run is not a reason to fail a contrast check.
    if (proc) {
      proc.kill();
      await new Promise((r) => { proc.once('exit', r); setTimeout(r, 3000); });
    }
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
  }
});
