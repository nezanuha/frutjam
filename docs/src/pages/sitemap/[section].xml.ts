import type { APIRoute, GetStaticPaths } from 'astro';
import { SECTIONS, sitemapSection } from '@/lib/sitemap';

export const getStaticPaths: GetStaticPaths = () => Object.keys(SECTIONS).map((section) => ({ params: { section } }));

export const GET: APIRoute = ({ params }) => sitemapSection(params.section!);
