/**
 * frutjam.com's site script (frontend/src/js/app.js and its modules), ported
 * unchanged apart from types and search, which uses Pagefind's full-text index.
 */

function getParentPathSegment(path: string) {
  const normalizedPath = path.replace(/\/+$/, '');
  const segments = normalizedPath.split('/').filter(Boolean);
  return segments.length > 1 ? segments[segments.length - 2] : '/';
}

function initTagManager() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-NXRKTW2T');
    `;
  document.head.appendChild(script);
}

// ── components/themeSelector.js ─────────────────────────────────────────────

function detectSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'darkberry' : 'snowberry';
}

function applyTheme(theme: string) {
  const themeToRender = theme === 'system' ? detectSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', themeToRender);

  const container = document.getElementById('themeSelectorPopover');
  if (container) {
    container.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('menu-active'));
    container.querySelector(`.menu-item.${theme}-theme`)?.classList.add('menu-active');
  }
}

const saveTheme = (theme: string) => localStorage.setItem('selected-theme', theme);
const loadSavedTheme = () => localStorage.getItem('selected-theme') || 'system';

function initThemeSelector() {
  const savedTheme = loadSavedTheme();
  applyTheme(savedTheme);

  document.querySelectorAll<HTMLInputElement>(`input[name="theme"][value="${savedTheme}"]`).forEach((radio) => {
    radio.checked = true;
  });

  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectedTheme = (e.target as HTMLInputElement).value;
      saveTheme(selectedTheme);
      applyTheme(selectedTheme);
      document.querySelectorAll<HTMLInputElement>(`input[name="theme"][value="${selectedTheme}"]`).forEach((r) => {
        r.checked = true;
      });
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (loadSavedTheme() === 'system') applyTheme('system');
  });
}

// ── utils/search.js ──────────────────────────────────────────────────────────

/** The parts of Pagefind's browser API the search modal uses. */
interface PagefindSection {
  title: string;
  url: string;
  excerpt: string;
}
interface PagefindPage extends PagefindSection {
  meta: { title: string; category?: string };
  sub_results: PagefindSection[];
}
interface Pagefind {
  init(): Promise<void>;
  debouncedSearch(query: string, options?: object, delay?: number): Promise<{ results: Array<{ data(): Promise<PagefindPage> }> } | null>;
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Pages are built as files (button.html) but served without the extension. */
const cleanUrl = (url: string) => url.replace(/\.html(?=#|$)/, '');

async function initializeSearch() {
  let modal = document.getElementById('searchModal') as HTMLDialogElement | null;
  if (modal) {
    modal.showModal();
    return;
  }

  try {
    // Pagefind: a full-text index built from the finished pages
    // (astro.config.mjs). It picks the index for this page's <html lang>, so
    // every language searches its own pages. The path is built at runtime:
    // the files exist only in the built site, never in the source.
    const pagefindPath = '/pagefind/pagefind.js';
    const pagefind: Pagefind | null = await import(/* @vite-ignore */ pagefindPath).catch(() => null);
    await pagefind?.init();

    const modalHtml = `
        <dialog class="modal modal-center modal-middle" id="searchModal">
          <div class="modal-content h-104 overflow-hidden">
            <input type="text" id="search-input" placeholder="Search Frutjam..." class="input input-sm w-full" autocomplete="off">
            <div id="search-results" class="flex flex-col gap-1 px-1 overflow-auto h-72">
                <p class="text-sm text-center text-neutral py-4">Type to search...</p>
            </div>
            <div class="divider my-2"></div>
            <div class="flex justify-end">
                <button type="button" class="btn btn-xs btn-outline mb-4" onclick="searchModal.close()">
                    <span class="text-xs">Close</span>
                    <kbd class="kbd kbd-xs hidden lg:block">⌘K</kbd>
                </button>
            </div>
          </div>
          <button type="button" class="modal-backdrop" onclick="searchModal.close()"></button>
        </dialog>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('searchModal') as HTMLDialogElement;
    const input = modal.querySelector<HTMLInputElement>('#search-input')!;
    const resultsDiv = modal.querySelector<HTMLDivElement>('#search-results')!;

    const message = (text: string, className = 'para text-center py-4') => {
      const p = document.createElement('p');
      p.className = className;
      p.textContent = text;
      resultsDiv.replaceChildren(p);
    };

    input.addEventListener('input', async (e) => {
      const query = (e.target as HTMLInputElement).value.trim();
      if (!query) {
        resultsDiv.innerHTML = '<p class="para text-center opacity-50 py-4">Type to search...</p>';
        return;
      }
      if (!pagefind) {
        // `npm run dev` has no index: it is built with the site.
        message('Search is available on the built site (npm run build && npm run preview).');
        return;
      }

      // Waits for typing to pause; a newer query makes this one return null.
      const search = await pagefind.debouncedSearch(query, {}, 150);
      if (!search) return;
      const pages = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));

      // One row per matching section, like the headings-only search before,
      // with the matched words shown in context.
      const rows = pages.flatMap((page) => {
        const sections = page.sub_results.length ? page.sub_results.slice(0, 3) : [{ title: page.meta.title, url: page.url, excerpt: page.excerpt }];
        return sections.map((section) => ({
          url: cleanUrl(section.url),
          title: section.title && section.title !== page.meta.title ? `${page.meta.title} > ${section.title}` : page.meta.title,
          category: page.meta.category ?? '',
          excerpt: section.excerpt,
        }));
      });

      if (!rows.length) {
        message(`No results for "${query}"`);
        return;
      }
      // Titles come from page text, so they are escaped; excerpts are Pagefind's
      // own escaped HTML with <mark> around the matched words.
      resultsDiv.innerHTML = rows
        .map((row) => `
                    <a href="${escapeHtml(row.url)}" class="flex flex-col p-3 rounded-lg hover:surface-2 group transition-colors" onclick="searchModal.close()">
                        <div class="font-medium group-hover:text-primary">${escapeHtml(row.title)}</div>
                        <div class="text-xs opacity-60"><span class="uppercase">${escapeHtml(row.category)}</span> • ${row.excerpt}</div>
                    </a>
                `)
        .join('');
    });

    modal.showModal();
    requestAnimationFrame(() => input.focus());
  } catch (error) {
    console.error('Search failed to initialize:', error);
  }
}

// ── utils/snippet.js ─────────────────────────────────────────────────────────

function initSnippet() {
  document.addEventListener('click', async (event) => {
    const btn = (event.target as HTMLElement).closest('.snippet-copy-code-btn');
    if (!btn) return;

    const container = btn.closest('.snippet-container');
    const checkedRadio = container?.querySelector('.tabs input.tab:checked');
    let code: Element | null | undefined;
    if (checkedRadio) {
      const tabContent = checkedRadio.nextElementSibling;
      code = tabContent?.querySelector('td.code pre') ?? tabContent?.querySelector('pre code');
    } else {
      const panel = container?.querySelector('.snippet-tab-panel:not([hidden])') ?? container;
      code = panel?.querySelector('td.code pre') ?? panel?.querySelector('pre code');
    }
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      const tooltip = btn.closest('.tooltip')!;
      tooltip.setAttribute('data-tip', 'Copied!');
      tooltip.classList.add('tooltip-success');
      setTimeout(() => {
        tooltip.setAttribute('data-tip', 'Copy');
        tooltip.classList.remove('tooltip-success');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

// ── utils/clipboard.js ───────────────────────────────────────────────────────

function initClipboard() {
  document.addEventListener('click', async (event) => {
    const btn = (event.target as HTMLElement).closest('.copy-clipboard');
    if (!btn) return;

    const textToCopy = btn.getAttribute('data-clipboard') ?? '';
    try {
      await navigator.clipboard.writeText(textToCopy);
      const tooltip = btn.closest('.tooltip')!;
      tooltip.setAttribute('data-tip', 'Copied!');
      tooltip.classList.add('tooltip-success');
      setTimeout(() => {
        tooltip.setAttribute('data-tip', 'Copy');
        tooltip.classList.remove('tooltip-success');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

function copyPage(btnId: string) {
  const btn = document.getElementById(btnId) as HTMLButtonElement | null;
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const mdUrl = `${window.location.href.replace(/\/$/, '')}.md`;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span><span class="hidden lg:inline">Fetching...</span>';
    btn.disabled = true;

    try {
      const response = await fetch(mdUrl);
      if (!response.ok) throw new Error('File not found');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg><span class="hidden lg:inline">Page Copied!</span>';
    } catch (err) {
      console.error(err);
      btn.innerText = 'Error!';
    } finally {
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }, 2000);
    }
  });
}

// ── utils/tocScrollspy.js ────────────────────────────────────────────────────

function initTocScrollspy() {
  const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('#toc-menu .toc-link')];
  if (!tocLinks.length) return;

  const article = document.querySelector('article');
  if (!article) return;

  /**
   * Only track headings the contents list actually shows. A page whose list
   * is top-level only — the plugin pages, with thirty sections — still has
   * its h3s in the article, and tracking one of those matched no link, so
   * the highlight blinked off every time the reader scrolled into a
   * subsection and back on at the next h2. Ignoring them keeps the enclosing
   * section lit the whole way through it.
   */
  const linkable = new Set(
    tocLinks.map((l) => l.getAttribute('href')?.slice(1)).filter((id): id is string => Boolean(id)),
  );
  const headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    .filter((h) => linkable.has(h.id));
  if (!headings.length) return;

  let ticking = false;
  let cachedOffsets = headings.map((h) => h.offsetTop);

  /**
   * The element that actually scrolls, found by walking up rather than
   * assumed to be the nearest div. The plugin page puts the list straight
   * into the sticky sidebar and the component pages wrap it in a box of
   * their own; `closest('div')` picked the wrong one of those and then
   * scrolled something that could not scroll.
   */
  const tocContainer = (() => {
    for (let el = document.querySelector('#toc-menu')?.parentElement; el; el = el.parentElement) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return el;
      if (el.tagName === 'BODY') break;
    }
    return null;
  })();
  let lastActiveId: string | null = null;
  let tocScrollTimer: ReturnType<typeof setTimeout>;

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { cachedOffsets = headings.map((h) => h.offsetTop); }, 200);
  }, { passive: true });

  function update() {
    const scrollY = window.scrollY + 100;
    let activeId: string | null = null;
    for (let i = 0; i < headings.length; i++) {
      if (cachedOffsets[i] <= scrollY) activeId = headings[i].id;
      else break;
    }
    if (activeId !== lastActiveId) {
      lastActiveId = activeId;
      clearTimeout(tocScrollTimer);
      tocScrollTimer = setTimeout(() => {
        /**
         * `menu-active` paints the highlight; `aria-current` is what says it
         * out loud. Without the attribute a screen reader reader gets no
         * sense of position in the page at all — the highlight is colour and
         * nothing else. Set on the link rather than removed from the others,
         * so exactly one entry is ever current.
         */
        tocLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${activeId}`;
          link.classList.toggle('menu-active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
        const activeLink = tocLinks.find((l) => l.getAttribute('href') === `#${activeId}`);
        /**
         * Only move the list when the highlight would otherwise be off it.
         * Re-centring on every heading means the contents slide under the
         * reader's eyes the whole way down the page, which is the jumping
         * people report — and on a page with thirty sections it happens
         * constantly. A margin keeps the next entry or two in view, so the
         * list settles instead of tracking the scroll.
         */
        if (activeLink && tocContainer && tocContainer.scrollHeight > tocContainer.clientHeight) {
          const link = activeLink.getBoundingClientRect();
          const box = tocContainer.getBoundingClientRect();
          const margin = 48;
          const above = link.top < box.top + margin;
          const below = link.bottom > box.bottom - margin;
          if (above || below) {
            const offset = link.top - box.top + tocContainer.scrollTop;
            tocContainer.scrollTo({
              top: offset - tocContainer.clientHeight / 2 + link.height / 2,
              behavior: 'smooth',
            });
          }
        }
      }, 80);
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  update();
}

// ── app.js ───────────────────────────────────────────────────────────────────

async function initApp() {
  const pathName = window.location.pathname;
  const directoryName = getParentPathSegment(pathName);

  if (import.meta.env.PROD) initTagManager();
  initThemeSelector();

  (window as unknown as { openSearch: () => Promise<void> }).openSearch = initializeSearch;

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      initializeSearch();
    }
  });

  initSnippet();

  if (['/', 'components', 'docs', 'plugins', 'blocks', 'blog'].includes(directoryName)) {
    document.querySelector('.sidebar .menu-active')?.scrollIntoView({ block: 'center', behavior: 'instant' });

    copyPage('copy-page');
    initClipboard();
    initTocScrollspy();

    await initMarkdownEditors();
  }
}

/**
 * The editors on the plugin page, and the two on the home page.
 *
 * Each demo is a class, and the options live here rather than in an attribute
 * on the textarea: the docs page then only has to say which demo it wants, and
 * what a demo actually does is readable in one place instead of spread across
 * escaped JSON in MDX.
 *
 * Add a demo by adding a line. The key is the class, so `mte-variables` means
 * `<textarea class="mte-variables">`.
 */
const MTE_DEMOS: Record<string, Record<string, unknown>> = {
  // the two the home page and the older docs pages already use
  'plain-markdown-editor': {},
  'hybrid-markdown-editor': { mode: 'hybrid' },

  // modes, side by side
  'mte-hybrid': { mode: 'hybrid' },
  'mte-plain': {},

  // how small it goes
  'mte-minimal': {
    toolbar: ['bold', 'italic', 'link'],
    footer: false,
    minHeight: 120,
  },

  // a comment box: no headings, no images, counts what matters
  'mte-comment': {
    toolbar: ['bold', 'italic', 'strikethrough', 'link', 'code', 'ul', 'ol'],
    footer: { chars: true, words: true, line: false, col: false },
    minHeight: 140,
    find: false,
  },

  // a CMS body field: H1 belongs to the page, so the dropdown starts at H2
  'mte-blog': {
    mode: 'hybrid',
    toolbar: [
      'undo', 'redo', { heading: { levels: [2, 3, 4] } }, 'bold', 'italic',
      'blockquote', 'ul', 'ol', 'code', 'codeblock', 'table', 'link', 'image',
      'preview',
    ],
    footer: { words: true, chars: true, line: true, col: true },
  },

  // merge tags, with sample values the preview substitutes
  'mte-variables': {
    toolbar: ['bold', 'italic', 'variables', 'preview'],
    variables: [
      { label: 'First name', value: '{{first_name}}', sample: 'Hannes' },
      { label: 'Company', value: '{{company}}', sample: 'Northwind' },
      {
        label: 'Invoice',
        items: [
          { label: 'Number', value: '{{invoice.number}}', sample: 'INV-2026-0041' },
          { label: 'Total', value: '{{invoice.total}}', sample: '€1,240.00' },
          { label: 'Due date', value: '{{invoice.due}}', sample: '12 December 2026' },
        ],
      },
    ],
  },

  // type a draft, reload the page, and it offers it back
  'mte-autosave': { autosave: { key: 'docs-demo' } },

  // a document long enough that finding something in it is the point
  'mte-find': { mode: 'hybrid' },

  // starts with a table in it, so the bar beside it has something to edit
  'mte-table': { mode: 'hybrid', tableBar: true },

  // every count the status bar can show
  'mte-footer': { footer: { line: true, col: true, chars: true, words: true } },
};

async function initMarkdownEditors() {
  const selector = Object.keys(MTE_DEMOS).map((name) => '.' + name).join(', ');
  if (!document.querySelector(selector)) return;

  // When this moves to markdown-text-editor@2, add the stylesheet here:
  //
  //   await import('markdown-text-editor/style.css');
  //
  // 2.0 stopped injecting a <style> tag, so without it every editor on the
  // page renders unstyled. 1.9.x carries its CSS inside the JavaScript and
  // exports no stylesheet to import, which is why this is a note and not a
  // line of code. The demos for anything 2.0 added -- the variables list,
  // draft recovery, the table bar -- also do nothing until that bump,
  // because 1.9.x ignores options it has never heard of.
  const { default: MarkdownEditor } = await import('markdown-text-editor');

  for (const [name, options] of Object.entries(MTE_DEMOS)) {
    document.querySelectorAll('.' + name).forEach((element) => {
      new MarkdownEditor(element, { placeholder: 'Start writing...', ...options });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
