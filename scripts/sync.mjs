#!/usr/bin/env node
/**
 * 从 Obsidian 知识库同步博客内容到 Astro content collections。
 *
 * 源目录(在 Obsidian 库内):
 *   05_输出/magellen-kol/06_平台适配/blog/  -> src/content/posts/   (成品文章)
 *   05_输出/博客花园/                       -> src/content/notes/   (花园快照)
 *
 * 规则:
 *   - 镜像同步:目标目录中源已不存在的文件会被删除。
 *   - 跳过 README.md 和以 . 开头的文件(源目录可放说明文件)。
 *   - frontmatter 校验:缺少必填字段(title/date)时报错退出。
 *   - 花园快照中的 [[wikilink]] 会保留(由 remark-wiki-link 渲染为 /notes/ 链接)。
 *   - draft: true 的文章/笔记不会被打包进站(但会保留在 content 目录)。
 *
 * 用法: npm run sync   (或 node scripts/sync.mjs)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const OBSIDIAN = process.env.OBSIDIAN_DIR || join(homedir(), 'Obsidian_data');
const SOURCES = [
  { dir: join(OBSIDIAN, '05_输出/magellen-kol/06_平台适配/blog'), target: 'posts' },
  { dir: join(OBSIDIAN, '05_输出/博客花园'), target: 'notes' },
  { dir: join(OBSIDIAN, '05_输出/精翻'), target: 'translations' },
];

const REQUIRED = ['title', 'date'];

const isContentFile = (f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('.');

/**
 * 把 [[目标|别名]] / [[目标]] 转换为 markdown 链接。
 * 目标存在于花园源目录(已发布)时链接到 /notes/<页面名>;
 * 否则转纯文本(保留别名或目标名)。
 */
function convertWikiLinks(content, knownNotes) {
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, target, alias) => {
    const clean = target.trim();
    const display = (alias ?? target).trim();
    if (knownNotes.has(clean)) {
      return `[${display}](/notes/${encodeURIComponent(clean)})`;
    }
    return display;
  });
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: content };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      v = v.replace(/^['"]|['"]$/g, '');
    }
    data[kv[1]] = v;
  }
  return { data, body: content.slice(m[0].length) };
}

function validate(file, data) {
  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length > 0) {
    console.error(`✗ ${file}: 缺少 frontmatter 字段: ${missing.join(', ')}`);
    process.exitCode = 1;
    return false;
  }
  return true;
}

function syncDir(srcDir, targetDir, knownNotes) {
  const targetAbs = resolve(join('src/content', targetDir));
  mkdirSync(targetAbs, { recursive: true });

  let copied = 0;
  if (existsSync(srcDir)) {
    for (const f of readdirSync(srcDir)) {
      if (!isContentFile(f)) continue;
      const content = convertWikiLinks(readFileSync(join(srcDir, f), 'utf8'), knownNotes);
      const { data } = parseFrontmatter(content);
      if (!validate(join(srcDir, f), data)) continue;
      writeFileSync(join(targetAbs, f), content, 'utf8');
      copied++;
    }
  } else {
    console.warn(`! 源目录不存在: ${srcDir}`);
  }

  // 清理目标中源已删除的文件
  const known = new Set(existsSync(srcDir) ? readdirSync(srcDir).filter(isContentFile) : []);
  let removed = 0;
  for (const f of readdirSync(targetAbs)) {
    if (!known.has(f)) {
      rmSync(join(targetAbs, f));
      removed++;
    }
  }
  console.log(`✓ ${targetDir}: 同步 ${copied} 个文件,清理 ${removed} 个`);
}

// 花园源目录中的已发布笔记名(去 .md),用于 wikilink 转换
const notesDir = join(OBSIDIAN, '05_输出/博客花园');
const knownNotes = new Set(
  existsSync(notesDir) ? readdirSync(notesDir).filter(isContentFile).map((f) => f.replace(/\.md$/, '')) : []
);

for (const { dir, target } of SOURCES) {
  syncDir(dir, target, knownNotes);
}

if (process.exitCode) {
  console.error('同步完成,但有 frontmatter 校验错误,请修复后重试。');
} else {
  console.log('同步完成。');
}
