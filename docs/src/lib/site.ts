import { getCollection, type CollectionEntry } from 'astro:content';
import categories from '@/data/categories.json';
import { DEFAULT_LANG, isEnglishOnlyPath, langUrl, splitLang } from './i18n';

declare const __FRUTJAM_VERSION__: string;

export const SITE = 'https://frutjam.com';
export const FRUTJAM_VERSION = __FRUTJAM_VERSION__;

/** Pages frutjam.com served only in English: no language switcher, no hreflang. */
export function isEnglishOnly(pathname: string) {
  return isEnglishOnlyPath(splitLang(pathname).path);
}

export type Doc = CollectionEntry<'docs'>;
export type Post = CollectionEntry<'blog'>;

export interface Category {
  slug: string;
  name: string;
  heading: string;
  description: string;
  type: string;
  order: number;
  metaTitle: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  updatedAt: string;
  /** schema.org FAQPage JSON-LD shown on the category page. */
  faq?: object;
  /** The translated columns, by language code. */
  i18n?: Record<string, Partial<Category>>;
}

export const CATEGORIES = categories as Category[];

/** A category with its translated name, heading and description for `lang`. */
export function categoryIn(category: Category, lang: string): Category {
  const translated = lang === DEFAULT_LANG ? undefined : category.i18n?.[lang];
  return translated ? { ...category, ...translated } : category;
}

export const categoriesIn = (lang: string) => CATEGORIES.map((c) => categoryIn(c, lang));

// A doc's id is "<lang>/<category>/<slug>"; English lives under "en/".
export const langOf = (doc: Doc) => doc.id.split('/')[0];
export const categoryOf = (doc: Doc) => doc.id.split('/')[1];
export const slugOf = (doc: Doc) => doc.id.split('/').slice(2).join('/');
/** The page path, with the language prefix English does not have. */
export const docUrl = (doc: Doc) => langUrl(langOf(doc), `/${categoryOf(doc)}/${slugOf(doc)}`);

/** get_page_navs(): categories by order, their active docs by (order, slug). */
export async function pageNavs(lang: string = DEFAULT_LANG) {
  const docs = await getCollection('docs');
  return categoriesIn(lang).map((category) => ({
    ...category,
    docs: docs
      .filter((d) => langOf(d) === lang && categoryOf(d) === category.slug)
      .sort((a, b) => a.data.order - b.data.order || slugOf(a).localeCompare(slugOf(b))),
  }));
}

/** The flat prev/next order doc_page() walks, within one language. */
export async function flatDocs(lang: string = DEFAULT_LANG) {
  return (await pageNavs(lang)).flatMap((c) => c.docs);
}

export async function publishedPosts() {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort((a, b) =>
    b.data.createdAt.localeCompare(a.data.createdAt)
  );
}

const AP_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

/** Django's `date:"N j, Y"` (AP-style month), in UTC as the site rendered it. */
export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${AP_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
