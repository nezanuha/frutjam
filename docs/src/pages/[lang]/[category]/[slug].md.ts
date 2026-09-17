/** Translated `<doc>.md`, e.g. /ja/components/button.md. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { docMarkdown } from '@/lib/markdown';
import { categoryOf, langOf, slugOf, type Doc } from '@/lib/site';
import { DEFAULT_LANG } from '@/lib/i18n';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('docs'))
    .filter((doc) => langOf(doc) !== DEFAULT_LANG)
    .map((doc) => ({ params: { lang: langOf(doc), category: categoryOf(doc), slug: slugOf(doc) }, props: { doc } }));

export const GET: APIRoute = ({ props }) =>
  new Response(docMarkdown((props as { doc: Doc }).doc), {
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'x-robots-tag': 'noindex, follow' },
  });
