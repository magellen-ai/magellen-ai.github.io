import test from 'node:test';
import assert from 'node:assert/strict';
import { stripDuplicateLeadingTitle } from '../scripts/markdown.mjs';

test('删除与 frontmatter title 相同的正文首个一级标题', () => {
  const body = '\n# Agent Harness 定义\n\n正文\n\n## 二级标题\n';
  assert.equal(stripDuplicateLeadingTitle(body, 'Agent Harness 定义'), '\n正文\n\n## 二级标题\n');
});

test('保留与 frontmatter title 不同的正文一级标题', () => {
  const body = '\n# 独立章节标题\n\n正文\n';
  assert.equal(stripDuplicateLeadingTitle(body, '页面标题'), body);
});

test('只检查正文开头且不删除后续同名一级标题', () => {
  const body = '\n开场正文\n\n# 页面标题\n';
  assert.equal(stripDuplicateLeadingTitle(body, '页面标题'), body);
});
