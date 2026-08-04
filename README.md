# Magellen 博客

个人博客站点,基于 [Astro](https://astro.build),部署到 GitHub Pages。

- **文章** `/posts/`:来自 Obsidian `05_输出/magellen-kol/06_平台适配/blog/`,走完整写作工作流的成品长文。
- **花园** `/notes/`:来自 Obsidian `05_输出/博客花园/`,知识库精选快照,支持 `[[双链]]` 内联网络。
- **RSS** `/rss.xml`:全站订阅输出。

## 内容流

```text
Obsidian 05_输出/...blog/ ─┐
                           ├─ npm run sync ─→ src/content/ ─→ git push ─→ GitHub Actions ─→ GitHub Pages
Obsidian 05_输出/博客花园/ ─┘
```

1. 在 Obsidian 里写好/适配文章(frontmatter: `title` / `date` / `tags` / `summary`)。
2. `npm run sync` —— 从 Obsidian 镜像同步内容到 `src/content/`,校验 frontmatter。
3. `git add . && git commit && git push` —— 自动构建部署,几分钟内生效。

## 本地开发

```bash
npm install
npm run sync     # 同步 Obsidian 内容(可用 OBSIDIAN_DIR 覆盖库路径)
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
```

## 首次部署(GitHub Pages)

1. 把本目录推到 GitHub 新 repo(建议命名 `blog`):
   ```bash
   git init && git add . && git commit -m "init blog"
   git remote add origin git@github.com:<你的用户名>/blog.git
   git push -u origin main
   ```
2. GitHub repo Settings → Pages → Source 选 **GitHub Actions**。
3. 改 `astro.config.mjs`:
   - `site`: `https://<你的用户名>.github.io`
   - `base`: repo 名为 `blog` 时保持 `'/'`;其他名字改为 `/<repo名>/`
4. 再 push 一次触发部署,Pages 页会显示站点 URL。

## 发布节奏

- 文章:周级,配合 333 稳定输出法;质量门槛在 Obsidian 侧(magellen-kol 工作流)已经卡过。
- 花园:有想公开的笔记就发,快照制,更新博客需更新 `05_输出/博客花园/` 里的副本再 push。

## 目录结构

```text
src/
├── content.config.ts     # posts/notes 的 frontmatter schema
├── content/
│   ├── posts/            # 文章(同步产物,勿手改)
│   └── notes/            # 花园(同步产物,勿手改)
├── layouts/              # Base / Post 布局
├── pages/                # 首页、归档、标签、关于、RSS、404
└── styles/global.css
scripts/sync.mjs          # Obsidian → content 同步脚本
.github/workflows/deploy.yml
```
