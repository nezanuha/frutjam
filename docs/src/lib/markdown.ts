/**
 * Plain Markdown for a doc page: served at `<page>.md` and fed to llms.txt.
 * MDX components become what they mean in Markdown: a <Snippet> becomes its
 * code, one fence per framework tab.
 */
import { CATEGORIES, FRUTJAM_VERSION, SITE, categoryOf, docUrl, type Doc } from './site';
import { TAB_LANGS } from './remark-snippet-fences.mjs';

const SNIPPET_TABS: Array<[string, string, string]> = [
  ['html', 'HTML', 'html'], ['css', 'CSS', 'css'], ['js', 'JS', 'js'],
  ['react', 'React', 'jsx'], ['vue', 'Vue', 'vue'], ['svelte', 'Svelte', 'svelte'],
];

function fence(code: string, lang: string) {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((m) => m[0].length));
  const ticks = '`'.repeat(longest + 1);
  return `${ticks}${lang}\n${code}\n${ticks}`;
}

function snippetProps(source: string) {
  const props: Record<string, string> = {};
  for (const m of source.matchAll(/(\w+)=(?:\{("(?:[^"\\]|\\.)*")\}|"([^"]*)")/g)) {
    props[m[1]] = m[2] !== undefined ? JSON.parse(m[2]) : m[3];
  }
  return props;
}

/** A <Snippet> block's fences as the props remark-snippet-fences gives the component. */
function snippetBlockProps(attrs: string, inner: string) {
  const props = snippetProps(attrs);
  const fences = [...inner.matchAll(/^(`{3,})([^\n]*)\n(?:([\s\S]*?)\n)?\1[ \t]*$/gm)];
  const tabs = fences.length > 1 || /(?:^|\s)tabs(?:\s|$)/.test(attrs);
  for (const [, , lang, code = ''] of fences) {
    const fenceLang = lang.trim();
    if (!tabs) {
      props.code = code;
      if (fenceLang && fenceLang !== 'html') props.lang = fenceLang;
    } else {
      props[TAB_LANGS[fenceLang as keyof typeof TAB_LANGS]] = code;
    }
  }
  return props;
}

function snippetToMarkdown(props: Record<string, string>) {
  const tabs = SNIPPET_TABS.filter(([key]) => props[key]);
  if (!tabs.length) return fence(props.code ?? '', props.lang ?? 'html');
  if (tabs.length === 1) return fence(props[tabs[0][0]], tabs[0][2]);
  return tabs.map(([key, label, lang]) => `**${label}**\n\n${fence(props[key], lang)}`).join('\n\n');
}

/** Card grids and callouts kept as markup: their headings, text and links, as Markdown. */
function rawHtmlToMarkdown(source: string) {
  const html = snippetProps(source).html ?? '';
  if (/^\s*<script\b/.test(html)) return '';
  return html
    .replace(/<(script|style|svg|textarea)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => `[${text.replace(/<[^>]+>/g, '').trim()}](${href})`)
    .replace(/<li\b[^>]*>/g, '\n- ')
    .replace(/<\/(p|div|li|ul|ol|section)>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .split('\n').map((l) => l.trim()).join('\n');
}

export function toPlainMarkdown(body: string): string {
  return body
    // Only the MDX imports heading the file; code samples have imports too.
    .replace(/^(?:[ \t]*\r?\n|import\s[^\n]*\n)*/, '')
    .replace(/^<Snippet\b([^>\n]*)>[ \t]*\r?\n([\s\S]*?)^<\/Snippet>[ \t]*$/gm, (_, attrs, inner) => snippetToMarkdown(snippetBlockProps(attrs, inner)))
    .replace(/^<RawHtml\b(.*)\/>\s*$/gm, (_, props) => rawHtmlToMarkdown(props))
    .replace(/^<DocTable\b[^>]*>\s*$|^<\/DocTable>\s*$/gm, '')
    .replace(/<span class="badge[^"]*">([^<]*)<\/span>/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** The `.md` response frutjam.com served, which Cherry MCP and other agents read. */
export function docMarkdown(doc: Doc): string {
  const category = CATEGORIES.find((c) => c.slug === categoryOf(doc));
  const url = `${SITE}${docUrl(doc)}`;
  return `---
title: "${doc.data.name}"
type: ${(category?.type ?? 'item').toLowerCase()}
version: "${FRUTJAM_VERSION}"
status: stable
date: ${doc.data.updatedAt.slice(0, 10)}
library: Frutjam
stack: tailwind_css
compatibility: universal
framework_agnostic: true
runtime_requirement: none
description: "${doc.data.metaDescription}"
url: ${url}
---

# ${doc.data.heading}

${toPlainMarkdown(doc.body ?? '')}
`;
}
