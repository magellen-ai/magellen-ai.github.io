#!/usr/bin/env node
/**
 * 从 Obsidian 的 05_输出/博客/ 同步内容到 Astro collections。
 * 页面 Markdown 可直接在 Obsidian 中编辑;文章、花园和精翻为发布源。
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { stripDuplicateLeadingTitle } from './markdown.mjs';

const OBSIDIAN = process.env.OBSIDIAN_DIR || join(homedir(), 'Obsidian_data');
const SOURCES = [
  { dir: join(OBSIDIAN, '05_输出/博客/文章'), target: 'posts', required: ['title', 'date'] },
  { dir: join(OBSIDIAN, '05_输出/博客/花园'), target: 'notes', required: ['title', 'date'] },
  { dir: join(OBSIDIAN, '05_输出/博客/精翻'), target: 'translations', required: ['title', 'date'] },
  { dir: join(OBSIDIAN, '05_输出/博客/页面'), target: 'pages', required: ['title'] },
];

const isContentFile = (f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('.');

function convertWikiLinks(content, knownNotes) {
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, alias) => {
    const clean = target.trim();
    const display = (alias ?? target).trim();
    return knownNotes.has(clean) ? `[${display}](/notes/${encodeURIComponent(clean)})` : display;
  });
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: content };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, '');
    }
    data[kv[1]] = value;
  }
  return { data, body: content.slice(m[0].length) };
}

function validate(file, data, required) {
  const missing = required.filter((key) => !data[key]);
  if (missing.length === 0) return true;
  console.error(`✗ ${file}: 缺少 frontmatter 字段: ${missing.join(', ')}`);
  process.exitCode = 1;
  return false;
}

function syncDir(srcDir, targetDir, knownNotes, required) {
  const targetAbs = resolve(join('src/content', targetDir));
  mkdirSync(targetAbs, { recursive: true });
  let copied = 0;

  if (existsSync(srcDir)) {
    for (const file of readdirSync(srcDir)) {
      if (!isContentFile(file)) continue;
      const converted = convertWikiLinks(readFileSync(join(srcDir, file), 'utf8'), knownNotes);
      const { data, body } = parseFrontmatter(converted);
      if (!validate(join(srcDir, file), data, required)) continue;
      if (data.draft === 'true' || data.draft === true) continue;
      const frontmatter = converted.slice(0, converted.length - body.length);
      const normalizedBody = targetDir === 'pages' ? body : stripDuplicateLeadingTitle(body, data.title);
      writeFileSync(join(targetAbs, file), frontmatter + normalizedBody, 'utf8');
      copied++;
    }
  } else {
    console.warn(`! 源目录不存在: ${srcDir}`);
  }

  const known = new Set();
  if (existsSync(srcDir)) {
    for (const file of readdirSync(srcDir)) {
      if (!isContentFile(file)) continue;
      const { data } = parseFrontmatter(readFileSync(join(srcDir, file), 'utf8'));
      if (data.draft === 'true' || data.draft === true) continue;
      known.add(file);
    }
  }
  let removed = 0;
  for (const file of readdirSync(targetAbs)) {
    if (!known.has(file)) {
      rmSync(join(targetAbs, file));
      removed++;
    }
  }
  console.log(`✓ ${targetDir}: 同步 ${copied} 个文件,清理 ${removed} 个`);
}

const notesDir = join(OBSIDIAN, '05_输出/博客/花园');
const knownNotes = new Set(
  existsSync(notesDir) ? readdirSync(notesDir).filter(isContentFile).map((file) => file.replace(/\.md$/, '')) : [],
);

for (const { dir, target, required } of SOURCES) {
  syncDir(dir, target, knownNotes, required);
}

if (process.exitCode) {
  console.error('同步完成,但有 frontmatter 校验错误,请修复后重试。');
} else {
  console.log('同步完成。');
}
