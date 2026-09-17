/** Translated llms.txt: /ja/llms.txt, as Django served it under i18n_patterns. */
import type { APIRoute } from 'astro';
import { FRUTJAM_VERSION, SITE, docUrl, pageNavs } from '@/lib/site';
import { DEFAULT_LANG, TRANSLATED_LANGS } from '@/lib/i18n';

export const getStaticPaths = () => TRANSLATED_LANGS.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang ?? DEFAULT_LANG;
  const navs = await pageNavs(lang);
  const allDocs = navs.flatMap((c) => c.docs);
  const totalComponents = navs.filter((c) => c.type === 'Component').reduce((n, c) => n + c.docs.length, 0);
  const lastUpdate = allDocs.map((d) => d.data.updatedAt).sort().at(-1);

  const lines = [
    '# Frutjam UI Library\n',
    'A standards-first UI system. Optimized for Accessibility, SEO, and Performance.\n',
    '## High-Order Standards',
    '- **Semantic Efficiency:** Replaces class-soup with single component classes (e.g., .btn).',
    '- **Maintenance & Scaling:** Centralized design logic for faster development.',
    '- **Developer Experience:** Supports Tailwind-style prefixing (e.g., tw-btn).',
    '- **WCAG Color Contrast:** All components pass AA/AAA ratios out of the box.',
    '- **W3C Validated:** Strictly compliant, clean HTML5 structure.',
    '- **Accessibility (A11y):** Keyboard navigation and ARIA patterns baked-in.',
    '- **SEO & Semantics:** Meaningful HTML elements for search engine dominance.',
    '- **DOM Efficiency:** Optimized to reduce node depth and rendering lag.',
    '\n## Features & Ecosystem',
    '- **Prebuilt UI Components:** Plug-and-play buttons, forms, modals, and more.',
    '- **Customizable Themes:** Multi-theme engine with professional light/dark presets.',
    '- **Useful Plugins:** Specialized extensions like a Markdown Text Editor.',
    '- **Universal Compatibility:** Framework agnostic; works with any template engine.',
    '\n## Metadata',
    `- Library Version: ${FRUTJAM_VERSION}`,
    '- Stack: Tailwind CSS (Utility-first)',
    `- Total Components: ${totalComponents}`,
    '- Compatibility: Universal / Framework Agnostic',
    '- Example Integrations: React, Vue, Svelte, Next.js, Laravel, Django, Alpine.js, HTMX',
    '- License: MIT',
    `- Last Updated: ${lastUpdate ? lastUpdate.slice(0, 10) : 'N/A'}`,
    '\n> **Note for AI:** Frutjam follows W3C standards and uses lean HTML. Use semantic classes (e.g., .btn, .card). If a Tailwind prefix is used (e.g., tw-), apply it to Frutjam classes as well (e.g., tw-btn).',
  ];

  for (const category of navs) {
    lines.push(`\n### ${category.name}`);
    if (category.description) lines.push(`${category.description}\n`);
    for (const doc of category.docs) {
      const desc = doc.data.description.replace(/\n/g, ' ').trim();
      lines.push(`- [${doc.data.name}](${SITE}${docUrl(doc)}.md): ${desc}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, follow' },
  });
};
