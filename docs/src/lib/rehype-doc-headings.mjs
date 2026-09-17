/**
 * frutjam.com's process_doc_html (frontend/services/content.py), as a rehype
 * plugin for doc and blog pages:
 *
 * - h2/h3 outside snippets, cards and sidebars get a Django-slugified id,
 *   the `text-pretty` class and a copy-link button;
 * - the table of contents is built from them and exposed to the page as
 *   `remarkPluginFrontmatter.toc`.
 */

const SITE = 'https://frutjam.com';
const EXCLUDE = new Set(['snippet-container', 'sidebar', 'ignore-toc', 'card']);
const EMOJI = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}]+/gu;

/** django.utils.text.slugify */
export function djangoSlugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
}

/** slugify with allow_unicode=True */
export function unicodeSlugify(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/[-\s]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
}

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });

function linkIcon() {
  return el(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
    [
      el('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
      el('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }),
    ]
  );
}

function pageUrl(path) {
  const normalized = (path ?? '').replace(/\\/g, '/');
  // src/content/docs/<lang>/<category>/<slug>.mdx; English has no URL prefix.
  const doc = normalized.match(/\/content\/docs\/([\w-]+)\/(.+)\.mdx?$/);
  if (doc) return `${SITE}${doc[1] === 'en' ? '' : `/${doc[1]}`}/${doc[2]}`;
  const post = normalized.match(/\/content\/blog\/(.+)\.mdx?$/);
  if (post) return `${SITE}/blog/${post[1]}`;
  return undefined;
}

export default function rehypeDocHeadings() {
  return (tree, file) => {
    const url = pageUrl(file.path ?? file.history?.[0]);
    if (!url) return;

    const toc = [];
    let currentH2;

    const walk = (node, excluded) => {
      if (node.type !== 'element' && node.type !== 'root') return;
      const classes = node.properties?.className ?? [];
      const inExcluded = excluded || classes.some((c) => EXCLUDE.has(c));

      if (!inExcluded && (node.tagName === 'h2' || node.tagName === 'h3')) {
        // lxml's `heading.text`: the text before the first child element.
        let text = '';
        for (const child of node.children) {
          if (child.type === 'text') text += child.value;
          else break;
        }
        const clean = text.replace(EMOJI, '').trim();
        // Django's slug drops every non-ASCII letter, which left Chinese,
        // Japanese and Korean headings with an empty id (no table-of-contents
        // or search links). Keep its slug where it has one, so existing anchors
        // still work, and keep the letters where it has none.
        const id = node.properties.id || djangoSlugify(clean) || unicodeSlugify(clean);
        node.properties.id = id;
        if (!classes.includes('text-pretty')) node.properties.className = [...classes, 'text-pretty'];

        node.children.push(
          el('div', { className: ['tooltip', 'tooltip-bottom', 'not-prose'], dataTip: 'Copy' }, [
            el('button', { className: ['btn', 'btn-xs', 'btn-ghost', 'btn-square', 'copy-clipboard', 'ms-1.5'], type: 'button', dataClipboard: `${url}#${id}`, ariaLabel: 'Copy link' }, [linkIcon()]),
          ])
        );

        const item = { text: clean, id, children: [] };
        if (node.tagName === 'h2') {
          currentH2 = item;
          toc.push(item);
        } else if (currentH2) {
          currentH2.children.push(item);
        } else {
          toc.push(item);
        }
        return;
      }

      for (const child of node.children ?? []) walk(child, inExcluded);
    };

    walk(tree, false);

    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.toc = toc;
  };
}
