// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://greenhands-always.github.io';
const BASE = process.env.BASE_PATH || '/blog/';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [sitemap()],
});
