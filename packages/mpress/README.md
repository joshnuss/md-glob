mpress
---------

A tool for working with directories of markdown files. Suitable for a blog or docs sites.

## Problem

Most markdown tools work with a **single file**.

But blogs and docs sites have **many files**. They need functions that work across multiple files, like displaying a menu, searching & filtering, grouping and pagination.

These functions take the most time to build.

**`mpress`** solves this problem by providing an API for working with a **collection of markdown files**.

## Benefits

- **Framework agnostic**. Works with React, Vue, Svelte, Hono, Express, etc..
- **Works everywhere**: SSR (server-side rendering), SSG (static-site generators), MPA (multi page apps) or SPA (single page apps).
- **Filter** and **sort** by tags, author, date, etc...
- Full **pagination** support.
- **Based on [Unified](https://unifiedjs.com)**. Supports `remark` and `rehype` plugins.
- Supports **front-matter** like `title`, `summary`, `author`, `date` and `tags`.
- Folder structure can be **hierarchical** (docs) **or flat** (blog).
- **Integrated search engines** like Algolia and MeiliSearch. Updates search index during CI deployment.

## Setup

```sh
pnpm install mpress
```

## Usage

Create folders to hold `.md` files:

```sh
mkdir docs
mkdir posts
```

Add a file with frontmatter `docs/index.md`

```
---
title: Example doc
author: Josh
date: 2024-11-01
---

Hi, this is my first doc
```

First, create shared instances of `dir()` in `src/lib/server/docs.ts`:

```typescript
import { dir } from 'mpress'

// load docs folder
export const docs = dir('./docs')

// load posts folder
export const blog = dir('./posts')
```

Then, use those shared instances to get docs or posts by path:

```typescript
// src/routes/docs/[...path]/+page.server.ts
import { docs } from '$lib/server/docs.ts'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const doc = docs.get(params.path)

  if (!doc) throw error(404)

  return { doc }
}
```

To display a menu, use `docs.roots()`:

```typescript
// src/routes/+layout.server.ts
import { docs } from '$lib/server/docs.ts'

export async function load() {
  return {
    menus: docs.roots()
  }
}
```

To display a list of blog posts with paging:

```typescript
// src/routes/+page.server.ts
import { blog } from '$lib/server/docs.ts'

export async function load({ url }) {
  const page = url.searchParams.get('page')
  const posts = blog.search({ page })

  return { posts }
}
```

If using vite, the page can be reloaded using `vite-plugin-full-reload` in `vite.config.ts`:

```diff
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
++import reload from 'vite-plugin-full-reload'

export default defineConfig({
  plugins: [
++  reload(['./docs/**/*.md', './posts/*.md']),
    sveltekit()
  ]
})
```

## License

MIT
