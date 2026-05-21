---
description: "Use when creating, editing, or reviewing blog posts under src/content/blog/. Covers required frontmatter schema, filename convention, image asset paths, and Chinese writing style for the karldu.cn Astro blog."
applyTo: "src/content/blog/**/*.{md,mdx}"
---

# 博客文章写作规范

适用于 [src/content/blog](src/content/blog) 下的所有 Markdown / MDX 文章。Schema 定义见 [src/content.config.ts](src/content.config.ts)。

## 文件命名

- 格式:`YYYY-MM-DD-标题.md`，日期与 `pubDate` 保持一致。
- 标题部分使用中文,允许中英文混排。
- 标题中不能出现文件系统保留字符 `/ \ : * ? " < > |`。常见替换:`#` → `＃`、`(` `)` → `（` `）`、`.` 可保留但谨慎使用。

## Frontmatter (必须严格符合 schema)

```yaml
---
title: "文章标题"                              # 必填,带引号
description: "用于列表与 SEO 的一段简介。"       # 必填,带引号,一两句话
pubDate: "2025-10-09T13:27:18.000Z"            # 必填,ISO 8601 + UTC(Z)
updatedDate: "2025-10-09T14:14:58.000Z"        # 可选,修改文章内容时同步更新
category: "JavaScript"                          # 可选,单一分类
tags:                                           # 可选,数组;默认 []
  - "JavaScript"
remoteId: "5485042927830539417"                 # 必填,唯一字符串 ID(新文章使用 UUID 或雪花 ID)
---
```

规则:
- 所有字符串值用双引号包裹,保证含冒号、`#` 等字符时 YAML 不会解析失败。
- 日期一律使用带 `Z` 的 UTC ISO 8601 字符串,不要使用 `2025-10-09` 这种裸日期。
- `tags` 即使只有一个值也要写成数组形式;省略时不要写 `tags: []`,直接不写该字段。
- 不要新增 schema 之外的字段,会导致 Astro 构建失败。

## 图片与静态资源

- 文章图片存放在 [src/assets/blog-images](src/assets/blog-images) 下,每篇文章使用独立 UUID 子目录(目录名通常与 `remoteId` 或随机 UUID 对应)。
- 在 Markdown 中引用时使用相对路径或别名,而不是把图片放到 `public/`(除非确实是不需要 Astro 处理的静态文件)。

## 正文写作

- 默认使用简体中文写作;代码、专有名词、API 名保持英文原样并用反引号包裹,例如 `Promise`、`useEffect`。
- 一级标题(`#`)不要写在正文里,`title` 已经承担该角色;正文从 `##` 开始。
- 代码块标注语言:` ```js `、` ```ts `、` ```bash ` 等,避免无语言标记的裸 code fence。
- 中英文之间习惯加空格(参考既有文章风格),但不强制改动旧文。

## 不要做的事

- 不要修改既有文章的 `pubDate`、`remoteId`。
- 不要把图片或附件提交到 [public](public) 的根目录污染命名空间。
- 不要为了"补全注释"而修改你本次任务范围之外的文章。
