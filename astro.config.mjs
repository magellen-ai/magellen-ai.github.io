// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 部署前必改:
// 1. site: 改成你的 GitHub Pages 地址,如 https://<username>.github.io
// 2. base: 如果 repo 名不是 blog,改成 /<repo名>/;repo 名是 blog 时保持 '/'
const SITE = process.env.SITE_URL || 'https://magellen.github.io';
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [sitemap()],
});
