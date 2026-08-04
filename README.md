# Magellen 博客

个人博客站点,基于 [Astro](https://astro.build),部署到 GitHub Pages。

- **线上地址**: https://magellen-ai.github.io/
- **文章** `/posts/`:来自 Obsidian `05_输出/magellen-kol/06_平台适配/blog/`,走完整写作工作流的成品长文。
- **花园** `/notes/`:来自 Obsidian `05_输出/博客花园/`,知识库精选快照,`[[双链]]` 在同步时转换为站内链接。
- **RSS** `/rss.xml`:全站订阅输出。

## 内容流

```text
Obsidian 05_输出/...blog/ ─┐
                           ├─ npm run sync ─→ src/content/ ─→ git push ─→ GitHub Actions ─→ GitHub Pages
Obsidian 05_输出/博客花园/ ─┘
```

1. 在 Obsidian 里写好/适配文章(frontmatter: `title` / `date` / `tags` / `summary`)。
2. `npm run sync` —— 从 Obsidian 镜像同步内容到 `src/content/`,校验 frontmatter,并把花园 `[[双链]]` 转为站内链接(未发布目标降级为纯文本)。
3. `git add . && git commit && git push` —— 自动构建部署,几分钟内生效。

## 本地开发

```bash
npm install
npm run sync     # 同步 Obsidian 内容(可用 OBSIDIAN_DIR 覆盖库路径)
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
```

## 首次部署(已完成)

repo 命名 `magellen-ai.github.io`(user site 方案,URL 无路径前缀);
repo Settings → Pages → Source 为 **GitHub Actions**;`astro.config.mjs` 中 `site` 为
`https://magellen-ai.github.io`、`base` 为 `/`。

后续发布只需:Obsidian 写好 → `npm run sync` → `git push`。

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
scripts/sync.mjs          # Obsidian → content 同步脚本(wikilink 转换、frontmatter 校验)
.github/workflows/deploy.yml
```
