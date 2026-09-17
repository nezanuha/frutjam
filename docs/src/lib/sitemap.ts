/**
 * frutjam.com's sitemaps (frontend/sitemap.py): an index at /sitemap.xml and
 * one file per section at /sitemap/<section>.xml, the URLs Search Console
 * already knows. English only; /contact and /write-for-us are not part of
 * the static site.
 */
import { CATEGORIES, SITE, docUrl, flatDocs, publishedPosts } from './site';
import { LANG_CODES, langUrl } from './i18n';

interface Entry {
  path: string;
  lastmod: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
}

export const SECTIONS: Record<string, () => Promise<Entry[]>> = {
  static: async () => [
    // Home and Cherry exist in every language; the blog was English-only.
    ...LANG_CODES.flatMap((lang) => [
      { path: langUrl(lang, '/').replace(/^\/$/, ''), lastmod: '2026-07-15', changefreq: 'weekly' as const, priority: '0.8' },
      { path: langUrl(lang, '/products/cherry'), lastmod: '2026-07-18', changefreq: 'weekly' as const, priority: '0.8' },
    ]),
    { path: '/blog', lastmod: '2026-07-15', changefreq: 'weekly', priority: '0.8' },
  ],
  categories: async () =>
    LANG_CODES.flatMap((lang) =>
      [...CATEGORIES]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((c) => ({ path: langUrl(lang, `/${c.slug}`), lastmod: c.updatedAt, changefreq: 'weekly' as const, priority: '0.8' }))
    ),
  docs: async () =>
    (await Promise.all(LANG_CODES.map((lang) => flatDocs(lang)))).flatMap((docs) =>
      docs
        .sort((a, b) => b.data.updatedAt.localeCompare(a.data.updatedAt))
        .map((d) => ({ path: docUrl(d), lastmod: d.data.updatedAt, changefreq: 'weekly' as const, priority: '0.6' }))
    ),
  blog: async () =>
    (await publishedPosts())
      .sort((a, b) => b.data.updatedAt.localeCompare(a.data.updatedAt))
      .map((p) => ({ path: `/blog/${p.id}`, lastmod: p.data.updatedAt, changefreq: 'weekly', priority: '0.6' })),
  legal: async () => [
    { path: '/terms', lastmod: '2026-01-01', changefreq: 'monthly', priority: '0.3' },
    { path: '/privacy-policy', lastmod: '2026-01-01', changefreq: 'monthly', priority: '0.3' },
  ],
};

const XML = { 'content-type': 'application/xml; charset=utf-8' };

export async function sitemapIndex() {
  const items = await Promise.all(
    Object.entries(SECTIONS).map(async ([name, entries]) => {
      const latest = (await entries()).map((e) => e.lastmod).sort().at(-1);
      return `<sitemap><loc>${SITE}/sitemap/${name}.xml</loc>${latest ? `<lastmod>${latest.slice(0, 10)}</lastmod>` : ''}</sitemap>`;
    })
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`,
    { headers: XML }
  );
}

export async function sitemapSection(name: string) {
  const urls = (await SECTIONS[name]()).map(
    (e) => `<url><loc>${SITE}${e.path}</loc><lastmod>${e.lastmod.slice(0, 10)}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: XML }
  );
}
