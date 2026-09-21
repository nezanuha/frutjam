/**
 * `<post>.md`: a blog post as plain Markdown, for AI clients and for
 * cross-posting.
 *
 * The front matter is the one dev.to reads when an article is pasted in, so
 * `canonical_url` is already set to the frutjam.com URL — the credit for the
 * article stays here whichever site a reader finds first. `published: false`
 * lands it as a dev.to draft, never straight onto the site.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE, publishedPosts, type Post } from '@/lib/site';

/** Quoted for YAML: a colon or a quote in a title breaks the front matter. */
const yaml = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export function postMarkdown(post: Post): string {
  const url = `${SITE}/blog/${post.id}`;
  const lines = [
    '---',
    `title: ${yaml(post.data.title)}`,
    'published: false',
    `description: ${yaml(post.data.description)}`,
    `canonical_url: ${url}`,
  ];
  if (post.data.image) lines.push(`cover_image: ${post.data.image}`);
  lines.push('---', '', post.body?.trim() ?? '', '');
  return lines.join('\n');
}

export const getStaticPaths: GetStaticPaths = async () =>
  (await publishedPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));

export const GET: APIRoute = ({ props }) =>
  new Response(postMarkdown((props as { post: Post }).post), {
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'x-robots-tag': 'noindex, follow' },
  });
