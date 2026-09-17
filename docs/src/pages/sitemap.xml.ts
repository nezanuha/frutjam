import type { APIRoute } from 'astro';
import { sitemapIndex } from '@/lib/sitemap';

export const GET: APIRoute = () => sitemapIndex();
