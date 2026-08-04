import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const [posts, notes, translations] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('translations', ({ data }) => !data.draft),
  ]);

  const postItems = posts.map((post) => ({
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.summary ?? '',
    link: `/posts/${post.id.replace(/\.md$/, '')}/`,
  }));

  const noteItems = notes.map((note) => ({
    title: `[花园] ${note.data.title}`,
    pubDate: note.data.date,
    description: `花园笔记:${note.data.source ?? '来自 Obsidian 知识库'}`,
    link: `/notes/${note.id.replace(/\.md$/, '')}/`,
  }));

  const translationItems = translations.map((item) => ({
    title: `[精翻] ${item.data.title}`,
    pubDate: item.data.date,
    description: item.data.summary ?? `精翻:${item.data.original ?? ''}`,
    link: `/translations/${item.id.replace(/\.md$/, '')}/`,
  }));

  return rss({
    title: 'Magellen 的博客',
    description: '程序员精进、效率工具、AI 与量化。文章、花园笔记与外国文章精翻。',
    site: context.site ?? 'https://magellen-ai.github.io',
    items: [...postItems, ...noteItems, ...translationItems].sort(
      (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
    ),
    customData: '<language>zh-cn</language>',
  });
}
