import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { sidebar } from './src/sidebar.mjs';

const SITE = 'https://frutjam.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    starlight({
      title: 'Frutjam',
      description: 'CSS-only Tailwind CSS v4 component library. 65+ accessible UI components, zero JavaScript, WCAG AA guaranteed.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark:  './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.png',
      social: [
        { icon: 'github',   label: 'GitHub',  href: 'https://github.com/nezanuha/frutjam' },
        { icon: 'x.com',    label: 'X',       href: 'https://x.com/FrutjamUI' },
        { icon: 'discord',  label: 'Discord', href: 'https://discord.gg/FvjytjQSSZ' },
      ],
      customCss: ['./src/styles/custom.css'],
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '0.5rem',
          frames: {
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width',  content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${SITE}/og.png` } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ],
      plugins: [
        starlightBlog({
          title: 'Blog',
          authors: {
            nezanuha: {
              name: 'Nezanuha',
              url: 'https://frutjam.com',
            },
          },
        }),
      ],
      lastUpdated: true,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      editLink: {
        baseUrl: 'https://github.com/nezanuha/frutjam/edit/main/docs/',
      },
      sidebar,
    }),
  ],
});
