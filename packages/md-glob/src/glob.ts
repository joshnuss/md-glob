import fs from 'node:fs/promises'
import path from 'node:path'
import glob from 'tiny-glob'
import frontMatter from 'gray-matter'
import * as markdown from './markdown.js'
import type { Node } from './index.ts'

export interface GlobOptions {
  include?: {
    parent?: boolean
    children?: boolean
  }
}

export class Glob {
  #pattern: string
  #path: string

  constructor(pattern: string) {
    this.#pattern = pattern
    this.#path = pattern.split('*')[0]
  }

  async get_all(): Promise<Node[]> {
    return this.#readFiles(this.#pattern, {})
  }

  async get(id: string, options: GlobOptions = {}): Promise<Node | null> {
    const filePath = path.join(this.#path, id)
    const parts = path.parse(filePath)
    const dir = path.join(parts.dir, parts.name)

    if (await isDirectory(dir)) {
      return await this.#readDirectory(dir, options)
    }

    try {
      return await this.#readNode(filePath, options)
    } catch (e) {
      return null
    }
  }

  async tags(): Promise<Record<string, number>> {
    const nodes = await this.get_all()
    const group: Record<string, number> = {}

    for (const node of nodes) {
      for (const tag of node.tags) {
        group[tag] ||= 0
        group[tag] += 1
      }
    }

    return group
  }

  async root(options: GlobOptions = {}): Promise<Node> {
    return this.#readDirectory(this.#path, options)
  }

  async roots(options: GlobOptions = {}): Promise<Node[]> {
    const pattern = path.join(this.#path, '*.md')

    return this.#readFiles(pattern, options)
  }

  async parent(id: string): Promise<Node | null> {
    const parts = path.parse(id)

    if (!parts.dir) return null

    return this.get(parts.dir)
  }

  async children(id: string): Promise<Node[]> {
    const pattern = path.join(this.#path, id, '*.md')
    const dirPath = path.join(this.#path, id)

    if (await isDirectory(dirPath))
      return this.#readFiles(pattern, {})

    return []
  }

  async #readFiles(pattern: string, options: GlobOptions): Promise<Node[]> {
    const files = await glob(pattern)

    return await Promise.all(files.map(node => this.#readNode(node, options)))
  }

  async #readNode(filePath: string, options: GlobOptions): Promise<Node> {
    if (!filePath.endsWith('.md')) filePath = `${filePath}.md`

    const raw = await fs.readFile(filePath, 'utf8')
    const { data, content } = frontMatter(raw)
    const { title, date, author, summary, tags, ...metadata } = data
    const relativePath = path.relative(this.#path, filePath)
    const parts = path.parse(relativePath)
    const id = path.join(parts.dir, parts.name)
    const parent = options.include?.parent ? await this.parent(relativePath) : null
    const children: Node[] = []
    const html = await markdown.to_html(content)
    const text = await markdown.to_text(content)

    return {
      id,
      type: 'file',
      title,
      summary,
      date,
      author,
      tags: parse_tags(tags),
      metadata,
      content,
      html,
      text,
      parent,
      children
    }
  }

  async #readDirectory(dirPath: string, options: GlobOptions): Promise<Node> {
    const indexPath = path.join(dirPath, 'index.md')
    const relativePath = path.relative(this.#path, dirPath)
    const parent = options.include?.parent ? await this.parent(relativePath) : null
    const children = options.include?.children ? await this.children(relativePath) : []

    if (await exists(indexPath)) {
      const indexNode = await this.#readNode(indexPath, {})
      const parts = path.parse(indexPath)

      return {
        ...indexNode,
        id: path.relative(this.#path, parts.dir),
        type: 'directory',
        parent,
        children
      }
    }

    return {
      id: relativePath,
      type: 'directory',
      title: relativePath,
      summary: null,
      date: null,
      author: null,
      tags: [],
      metadata: {},
      content: '',
      html: '',
      text: '',
      parent,
      children
    }
  }
}

function parse_tags(tags: string | string[] | null): string[] {
  if (!tags) return []

  if (typeof tags == 'string') return tags.split(',').map((s) => s.trim())

  return tags
}

async function isDirectory(dir: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dir)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

async function exists(dir: string): Promise<boolean> {
  try {
    await fs.stat(dir)
    return true
  } catch (e) {
    return false
  }
}
