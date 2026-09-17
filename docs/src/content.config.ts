import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Documentation pages: /docs, /components, /blocks, /plugins. Fields mirror DocModel. */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    name: z.string(),
    heading: z.string(),
    description: z.string().default(''),
    metaTitle: z.string().default(''),
    metaDescription: z.string().default(''),
    order: z.number().default(0),
    status: z.enum(['new', 'updated']).optional(),
    related: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Translated pages only (scripts/i18n-hash.mjs):
    /** The English page this was translated from; if it has changed, this page is stale. */
    sourceHash: z.string().optional(),
    /** This file as generated; if it differs, a person edited the translation. */
    translationHash: z.string().optional(),
    /** Checked by a speaker of the language: never re-translated automatically. */
    reviewed: z.boolean().optional(),
  }),
});

/** Blog posts. Fields mirror BlogModel; bodies are the DB's Markdown. */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    metaTitle: z.string().default(''),
    metaDescription: z.string().default(''),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs, blog };
