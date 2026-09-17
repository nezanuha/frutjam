/**
 * Page-specific <head> tags, as frutjam.com rendered them.
 *
 * Doc, category and blog pages build theirs from frontmatter and
 * src/data/categories.json, so a new or edited page gets the right title,
 * description, Open Graph and JSON-LD. The hand-written pages (home, Cherry,
 * blog list, legal, 404) keep the tags captured in src/data/head.json.
 */
import { getCollection } from 'astro:content';
import staticHead from '@/data/head.json';
import { CATEGORIES, SITE, categoryIn, categoryOf, docUrl, flatDocs, langOf, pageNavs, type Doc, type Post } from './site';
import { DEFAULT_LANG, isLang, langUrl, splitLang } from './i18n';

export interface HeadTag {
  tag: string;
  attrs?: Record<string, string>;
  content?: string;
}

const LOGO = `${SITE}/static/frontend/images/frutjam-logo.svg`;
const pageUrl = (path: string) => (path === '/' ? SITE : `${SITE}${path}`);
const PUBLISHER = {
  '@type': 'Organization', name: 'Frutjam', url: SITE,
  logo: { '@type': 'ImageObject', url: LOGO, width: '1024', height: '1024' },
  '@id': `${SITE}#organization`,
};
const AUTHOR = { '@type': 'Organization', name: 'Nezanuha', url: 'https://nezanuha.com', '@id': 'https://nezanuha.com#organization' };

const meta = (key: string, value: string, content: string): HeadTag => ({ tag: 'meta', attrs: { [key]: value, content } });
const ldJson = (obj: object): HeadTag => ({ tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify(obj) });
const breadcrumb = (items: Array<[string, string]>) => ldJson({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});

/** Social tags share one 1200×630 JPEG, resized at build (src/lib/image-variants.mjs). */
function socialImage(image: string, alt: string): HeadTag[] {
  if (!image) return [];
  const jpeg = `${image}?width=1200&height=630&format=jpeg`;
  return [
    meta('property', 'og:image', jpeg), meta('property', 'og:image:secure_url', jpeg),
    meta('property', 'og:image:type', 'image/jpeg'), meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'), meta('property', 'og:image:alt', alt ?? ''),
  ];
}

const HOWTO_DOCS = ['configuration', 'installation', 'themes'];

async function docHead(doc: Doc): Promise<HeadTag[]> {
  const d = doc.data;
  const lang = langOf(doc);
  const path = docUrl(doc);
  const url = pageUrl(path);
  const flat = await flatDocs(lang);
  const i = flat.findIndex((x) => x.id === doc.id);
  const prev = flat[i - 1];
  const next = flat[i + 1];
  const category = categoryIn(CATEGORIES.find((c) => c.slug === categoryOf(doc))!, lang);
  const title = d.metaTitle || d.name;
  return [
    { tag: 'title', content: title },
    meta('name', 'description', d.metaDescription || d.description),
    meta('name', 'title', title),
    ...(prev ? [{ tag: 'link', attrs: { rel: 'prev', href: pageUrl(docUrl(prev)) } }] : []),
    ...(next ? [{ tag: 'link', attrs: { rel: 'next', href: pageUrl(docUrl(next)) } }] : []),
    { tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', title: 'Markdown version', href: `${url}.md` } },
    meta('property', 'og:type', 'article'),
    meta('property', 'og:title', d.metaTitle),
    meta('property', 'og:description', d.metaDescription),
    meta('property', 'og:url', url),
    ...socialImage(d.image, d.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', d.metaTitle),
    meta('name', 'twitter:description', d.metaDescription),
    meta('name', 'twitter:image', `${d.image}?width=1200&height=630&format=jpeg`),
    meta('property', 'article:published_time', d.createdAt),
    meta('property', 'article:modified_time', d.updatedAt),
    meta('property', 'article:author', 'Nezanuha'),
    meta('property', 'article:section', 'Documentation'),
    ldJson({
      '@context': 'https://schema.org',
      '@type': HOWTO_DOCS.includes(doc.id.split('/').pop()!) ? ['TechArticle', 'HowTo'] : ['Article', 'TechArticle'],
      headline: d.metaTitle, description: d.metaDescription,
      image: `${d.image}?width=1200&height=630&format=webp`,
      datePublished: d.createdAt, dateModified: d.updatedAt,
      author: AUTHOR, publisher: PUBLISHER, mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    }),
    breadcrumb([['Home', pageUrl(langUrl(lang, '/'))], [category.name, pageUrl(langUrl(lang, `/${category.slug}`))], [d.name, url]]),
  ];
}

async function categoryHead(slug: string, lang: string): Promise<HeadTag[]> {
  const category = categoryIn(CATEGORIES.find((c) => c.slug === slug)!, lang);
  const url = pageUrl(langUrl(lang, `/${slug}`));
  const title = category.metaTitle || category.name;
  const docs = (await pageNavs(lang)).find((c) => c.slug === slug)!.docs;
  return [
    { tag: 'title', content: title },
    meta('name', 'description', category.metaDescription || category.description),
    meta('name', 'title', title),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', category.metaTitle),
    meta('property', 'og:description', category.metaDescription),
    meta('property', 'og:url', url),
    ...socialImage(category.image, category.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', category.metaTitle),
    meta('name', 'twitter:description', category.metaDescription),
    meta('name', 'twitter:image', `${category.image}?width=1200&height=630&format=jpeg`),
    ldJson({
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      headline: title, description: category.metaDescription,
      image: `${category.image}?width=1200&height=630&format=webp`,
      dateModified: category.updatedAt, publisher: PUBLISHER,
      mainEntity: {
        '@type': 'ItemList', name: category.name, description: category.metaDescription,
        itemListElement: docs.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: pageUrl(docUrl(d)), name: d.data.name })),
      },
    }),
    breadcrumb([['Home', pageUrl(langUrl(lang, '/'))], [category.name, url]]),
    ...(category.faq ? [ldJson(category.faq)] : []),
  ];
}

function blogHead(post: Post): HeadTag[] {
  const b = post.data;
  const url = pageUrl(`/blog/${post.id}`);
  return [
    { tag: 'title', content: b.metaTitle },
    meta('name', 'description', b.metaDescription),
    meta('name', 'title', b.metaTitle),
    meta('property', 'og:type', 'article'),
    meta('property', 'og:title', b.metaTitle),
    meta('property', 'og:description', b.metaDescription),
    meta('property', 'og:url', url),
    ...socialImage(b.image, b.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', b.metaTitle),
    meta('name', 'twitter:description', b.metaDescription),
    meta('name', 'twitter:image', `${b.image}?width=1200&height=630&format=jpeg`),
    meta('property', 'article:published_time', b.createdAt),
    meta('property', 'article:modified_time', b.updatedAt),
    meta('property', 'article:author', 'Nezanuha'),
    meta('property', 'article:section', 'Blog'),
    ldJson({
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: b.metaTitle, description: b.metaDescription,
      image: `${b.image}?width=1200&height=630&format=webp`,
      datePublished: b.createdAt, dateModified: b.updatedAt,
      author: AUTHOR, publisher: PUBLISHER, mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    }),
    breadcrumb([['Home', SITE], ['Blog', pageUrl('/blog')], [b.title, url]]),
  ];
}

export async function headTags(path: string): Promise<HeadTag[]> {
  const fixed = (staticHead as Record<string, HeadTag[]>)[path];
  if (fixed) return fixed;

  const { lang, path: basePath } = splitLang(path);
  const segments = basePath.split('/').filter(Boolean);
  if (segments[0] === 'blog' && segments.length === 2) {
    const post = (await getCollection('blog')).find((p) => p.id === segments[1]);
    if (post) return blogHead(post);
  } else if (segments.length === 1 && CATEGORIES.some((c) => c.slug === segments[0])) {
    return categoryHead(segments[0], lang);
  } else if (segments.length === 2) {
    const doc = (await getCollection('docs')).find((d) => d.id === `${lang}/${segments.join('/')}`);
    if (doc) return docHead(doc);
  }
  throw new Error(`No <head> tags for ${path}: add the page to src/data/head.json`);
}
