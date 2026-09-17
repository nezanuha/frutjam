/**
 * The 13 languages frutjam.com served, and the UI strings for them.
 *
 * English is the default and has no URL prefix; the rest live under /<code>,
 * as Django's i18n_patterns served them. Page and doc text is translated file
 * by file (src/content/docs/<lang>/…, src/pages/<lang>/…); this module only
 * covers the shared chrome — header, footer, sidebar, doc and category shells.
 */
const dictionaries = import.meta.glob<Record<string, string>>('../data/i18n/*.json', { eager: true, import: 'default' });

export interface Language {
  code: string;
  /** What the language switcher shows. */
  label: string;
  /** og:locale, as Django's i18n_tags mapped it. */
  ogLocale: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'EN', ogLocale: 'en_US' },
  { code: 'zh-hans', label: '中文', ogLocale: 'zh_CN' },
  { code: 'zh-hant', label: '繁體', ogLocale: 'zh_TW' },
  { code: 'ja', label: '日本語', ogLocale: 'ja_JP' },
  { code: 'ko', label: '한국어', ogLocale: 'ko_KR' },
  { code: 'pt-br', label: 'PT', ogLocale: 'pt_BR' },
  { code: 'es', label: 'ES', ogLocale: 'es_ES' },
  { code: 'de', label: 'DE', ogLocale: 'de_DE' },
  { code: 'tr', label: 'Türkçe', ogLocale: 'tr_TR' },
  { code: 'pl', label: 'Polski', ogLocale: 'pl_PL' },
  { code: 'id', label: 'Indonesia', ogLocale: 'id_ID' },
  { code: 'vi', label: 'Tiếng Việt', ogLocale: 'vi_VN' },
  { code: 'fr', label: 'Français', ogLocale: 'fr_FR' },
];

export const DEFAULT_LANG = 'en';
export const LANG_CODES = LANGUAGES.map((l) => l.code);
export const TRANSLATED_LANGS = LANG_CODES.filter((code) => code !== DEFAULT_LANG);
export const isLang = (value: string) => LANG_CODES.includes(value);

/** "/components/button" in Japanese is "/ja/components/button"; English keeps the bare path. */
export function langUrl(lang: string, path: string) {
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** The language a URL belongs to, and the path without its prefix. */
export function splitLang(pathname: string) {
  // Pages are built as files (components/button.html), so the running page's
  // pathname can carry the extension; URLs on the site never do.
  const path = pathname.replace(/(?:\/index)?\.html$/, '').replace(/\/+$/, '') || '/';
  const [, first, ...rest] = path.split('/');
  if (first && first !== DEFAULT_LANG && isLang(first)) {
    return { lang: first, path: rest.length ? `/${rest.join('/')}` : '/' };
  }
  return { lang: DEFAULT_LANG, path };
}

/**
 * Pages Django served in English only: no translations, no hreflang, no
 * language switcher (frontend/templatetags/i18n_tags.py).
 */
export function isEnglishOnlyPath(path: string) {
  return path.startsWith('/blog') || ['/write-for-us', '/privacy-policy', '/terms', '/pricing', '/404', '/500'].includes(path);
}

/**
 * Translator for a language: `t('Search...')`. An untranslated string falls
 * back to the English source, exactly as gettext did.
 */
export function useTranslations(lang: string) {
  const dictionary = dictionaries[`../data/i18n/${lang}.json`] ?? {};
  return (text: string, vars?: Record<string, string>) => {
    const translated = dictionary[text] ?? text;
    return vars
      ? translated.replace(/%\((\w+)\)s/g, (match, name) => vars[name] ?? match)
      : translated;
  };
}
