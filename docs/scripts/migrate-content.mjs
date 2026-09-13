/**
 * Converts Django HTML template pages from frutjam.com into MDX content.
 *
 * Usage:
 *   node scripts/migrate-content.mjs
 *
 * Reads from:  FRUTJAM_COM_PATH (default: D:\repos\projects\frutjam.com)
 * Writes to:   ../src/content/docs/
 *
 * What it converts:
 *   - {% trans "..." %}              → plain string
 *   - {% blocktrans %}...{% endblocktrans %} → plain HTML (tags stripped)
 *   - <c-snippet lang="bash|css|js"> → ```lang code block
 *   - <c-snippet> with c-slot[html] + c-slot[react] → <Tabs> with code blocks
 *   - {% url ... %}                  → href removed
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRUTJAM_COM = process.env.FRUTJAM_COM_PATH
  ?? 'D:\\repos\\projects\\frutjam.com\\frontend\\templates\\frontend\\content\\community';

const DOCS_OUT = join(fileURLToPath(import.meta.url), '../../src/content/docs');

const SECTION_META = {
  docs: {
    overview:      { title: 'Overview',       description: "There's no complicated setup — uses the same config as Tailwind CSS." },
    installation:  { title: 'Installation',   description: 'Install Frutjam as a Tailwind CSS v4 plugin in one line.' },
    configuration: { title: 'Configuration',  description: 'Configure Frutjam with prefix, reset, root, logs, include, and exclude options.' },
    themes:        { title: 'Themes',         description: 'Switch themes with data-theme. Build custom themes using OKLCH CSS variables.' },
    colors:        { title: 'Colors',         description: 'OKLCH color system with hand-tuned WCAG AA compliant color pairs.' },
    typography:    { title: 'Typography',     description: 'Semantic heading and body typography utilities.' },
  },
  blocks: {
    header:  { title: 'Header Block',  description: 'Full-page header block with logo, nav, and mobile drawer.' },
    hero:    { title: 'Hero Block',    description: 'Landing page hero section with headline and CTA.' },
    pricing: { title: 'Pricing Block', description: 'Pricing table block with tiered plans.' },
  },
  plugins: {
    'markdown-editor': { title: 'Markdown Editor', description: 'Frutjam-styled markdown editor plugin.' },
  },
};

// Component title map for generating frontmatter
const COMPONENT_TITLES = {
  accordion: 'Accordion', alert: 'Alert', avatar: 'Avatar', badge: 'Badge',
  breadcrumb: 'Breadcrumb', button: 'Button', card: 'Card', carousel: 'Carousel',
  chat: 'Chat', checkbox: 'Checkbox', collapsible: 'Collapsible', combobox: 'Combobox',
  countdown: 'Countdown', diff: 'Diff', divider: 'Divider', drawer: 'Drawer',
  footer: 'Footer', header: 'Header', hero: 'Hero', indicator: 'Indicator',
  input: 'Input', join: 'Join', kbd: 'Kbd', link: 'Link', loading: 'Loading',
  marquee: 'Marquee', mask: 'Mask', menu: 'Menu', modal: 'Modal', navbar: 'Navbar',
  pagination: 'Pagination', popover: 'Popover', 'radial-progress': 'Radial Progress',
  radio: 'Radio', range: 'Range', rating: 'Rating', select: 'Select',
  sidebar: 'Sidebar', skeleton: 'Skeleton', stat: 'Stat', status: 'Status',
  steps: 'Steps', surface: 'Surface', swap: 'Swap', table: 'Table', tabs: 'Tabs',
  tag: 'Tag', textarea: 'Textarea', timeline: 'Timeline', toast: 'Toast',
  toggle: 'Toggle', tooltip: 'Tooltip',
};

function stripDjangoTags(html) {
  return html
    // <script> blocks are not valid in MDX body — strip entirely
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // <style> blocks likewise
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    // HTML comments → MDX comments
    .replace(/<!--([\s\S]*?)-->/g, (_, inner) => `{/*${inner}*/}`)
    // {% load i18n %}
    .replace(/\{%\s*load\s+\w+\s*%\}/g, '')
    // {% blocktrans %}...{% endblocktrans %} — keep inner HTML
    .replace(/\{%\s*blocktrans(?:[^%]|%(?!}))*%\}([\s\S]*?)\{%\s*endblocktrans\s*%\}/g, '$1')
    // {% trans "..." %} — keep the string
    .replace(/\{%\s*trans\s+"((?:[^"\\]|\\.)*)"\s*%\}/g, '$1')
    .replace(/\{%\s*trans\s+'((?:[^'\\]|\\.)*)'\s*%\}/g, '$1')
    // {% url ... as varname %}<p>...</p> — strip the tag, keep the paragraph
    .replace(/\{%\s*url\s+[^%]+%\}/g, '')
    // {{ variable }} — strip
    .replace(/\{\{[^}]+\}\}/g, '')
    // remaining {% ... %} tags
    .replace(/\{%[^%]*%\}/g, '')
    .trim();
}

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

function selfCloseVoidElements(html) {
  // <img ...> → <img ... />  (only if not already self-closed)
  return html.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s[^>]*)?>(?!\s*\/>)/gi, (m, tag, attrs) => {
    if (m.endsWith('/>')) return m;
    return `<${tag}${attrs ?? ''} />`;
  });
}

function convertSnippets(html) {
  const lines = [];

  // Single-language snippet with explicit lang
  html = html.replace(
    /<c-snippet\s+lang="(\w+)"[^>]*>([\s\S]*?)<\/c-snippet>/g,
    (_, lang, code) => `\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`
  );

  // view="code" without lang — default to html
  html = html.replace(
    /<c-snippet\s+view="code"[^>]*>([\s\S]*?)<\/c-snippet>/g,
    (_, code) => `\n\`\`\`html\n${code.trim()}\n\`\`\`\n`
  );

  // HTML/React tabbed snippet: <c-snippet> <c-slot name="html">...</c-slot> <c-slot name="react">...</c-slot> </c-snippet>
  html = html.replace(
    /<c-snippet>([\s\S]*?)<\/c-snippet>/g,
    (_, inner) => {
      const htmlMatch  = inner.match(/<c-slot\s+name="html">([\s\S]*?)<\/c-slot>/);
      const reactMatch = inner.match(/<c-slot\s+name="react">([\s\S]*?)<\/c-slot>/);

      if (htmlMatch && reactMatch) {
        return `
<Tabs>
  <TabItem label="HTML">
\`\`\`html
${htmlMatch[1].trim()}
\`\`\`
  </TabItem>
  <TabItem label="React">
\`\`\`jsx
${reactMatch[1].trim()}
\`\`\`
  </TabItem>
</Tabs>
`;
      }

      if (htmlMatch) {
        return `\n\`\`\`html\n${htmlMatch[1].trim()}\n\`\`\`\n`;
      }

      return inner;
    }
  );

  // Strip any remaining unconverted c-snippet / c-slot tags (leave their inner content)
  html = html.replace(/<\/?c-snippet[^>]*>/g, '');
  html = html.replace(/<\/?c-slot[^>]*>/g, '');

  return html;
}

function escapeCurlyInCode(html) {
  // Inside <code>...</code> elements, { and } are parsed as JSX expressions in MDX.
  // Replace them with HTML entities so they render as literal braces.
  return html.replace(/<code([^>]*)>([\s\S]*?)<\/code>/g, (_, attrs, inner) => {
    const escaped = inner.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
    return `<code${attrs}>${escaped}</code>`;
  });
}

function convertPage(djHtml, frontmatter) {
  let content = stripDjangoTags(djHtml);
  content = selfCloseVoidElements(content);
  content = escapeCurlyInCode(content);
  content = convertSnippets(content);

  const fm = [
    '---',
    `title: ${frontmatter.title}`,
    `description: ${frontmatter.description}`,
    '---',
  ].join('\n');

  const imports = `import { Tabs, TabItem } from '@astrojs/starlight/components';`;

  return `${fm}\n\n${imports}\n\n${content}`;
}

function processSection(sectionName, meta) {
  const srcDir = join(FRUTJAM_COM, sectionName);
  if (!existsSync(srcDir)) {
    console.warn(`  skipping ${sectionName} — source dir not found`);
    return;
  }

  for (const file of readdirSync(srcDir).filter(f => f.endsWith('.html'))) {
    const slug = basename(file, '.html');
    const fm = meta[slug];
    if (!fm) {
      console.warn(`  no meta for ${sectionName}/${slug} — skipping`);
      continue;
    }

    const src = readFileSync(join(srcDir, file), 'utf8');
    const mdx = convertPage(src, fm);

    const outPath = join(DOCS_OUT, sectionName, `${slug}.mdx`);
    writeFileSync(outPath, mdx, 'utf8');
    console.log(`  migrated: ${sectionName}/${slug}`);
  }
}

function processComponents() {
  const srcDir = join(FRUTJAM_COM, 'components');
  if (!existsSync(srcDir)) {
    console.warn('  components dir not found');
    return;
  }

  for (const file of readdirSync(srcDir).filter(f => f.endsWith('.html'))) {
    const slug = basename(file, '.html');
    const title = COMPONENT_TITLES[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const src = readFileSync(join(srcDir, file), 'utf8');

    // Extract description from first <p> tag
    const descMatch = src.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    let description = descMatch
      ? stripDjangoTags(descMatch[1]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160)
      : `${title} component.`;

    const mdx = convertPage(src, { title, description });
    const outPath = join(DOCS_OUT, 'components', `${slug}.mdx`);
    writeFileSync(outPath, mdx, 'utf8');
    console.log(`  migrated: components/${slug}`);
  }
}

console.log('Migrating docs...');
processSection('docs', SECTION_META.docs);

console.log('Migrating components...');
processComponents();

console.log('Migrating blocks...');
processSection('blocks', SECTION_META.blocks);

console.log('Migrating plugins...');
processSection('plugins', SECTION_META.plugins);

console.log('\nMigration complete.');
