import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});


const translations = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
    original: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});


export const collections = { posts, notes, translations, pages };
