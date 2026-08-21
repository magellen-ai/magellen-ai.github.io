// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://magellen-ai.github.io';
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [sitemap()],
  vite: {
    server: {
      // DDNSTO terminates HTTPS and forwards the original public Host header.
      // Keep localhost/LAN development access while allowing the blog preview hostname.
      allowedHosts: ['magellen-blog.kooldns.cn'],
    },
  },
});
