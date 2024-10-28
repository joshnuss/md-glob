import fs from 'node:fs/promises'
import path from 'node:path'
import glob from 'tiny-glob'
import frontMatter from 'gray-matter'
import * as markdown from './markdown.js'
import type { Node } from './index.ts'

export class Dir {
  path: string

  constructor(path: string) {
    this.path = path
  }

  async get(id: string): Promise<Node | null> {
    const filePath = path.join(this.path, id + '.md')

    try {
      return await this.#readNode(filePath)
    } catch (e) {
      return null
    }
  }

  async tags(): Promise<Record<string, number>> {
    const nodes = await this.descendants()
    const group: Record<string, number> = {}

    for (let node of nodes) {
      for (let tag of node.tags) {
        group[tag] ||= 0
        group[tag] += 1
      }
    }

    return group
  }

  async descendants(): Promise<Node[]> {
    const pattern = path.join(this.path, '**/*.md')

    return this.#readFiles(pattern)
  }

  async children(): Promise<Node[]> {
    const pattern = path.join(this.path, '*.md')

    return this.#readFiles(pattern)
  }

  async #readFiles(pattern: string): Promise<Node[]> {
    const files = await glob(pattern)

    return await Promise.all(files.map(this.#readNode))
  }

  async #readNode(filePath: string) {
    const raw = await fs.readFile(filePath, 'utf8')
    const { data, content } = frontMatter(raw)
    const { title, date, author, summary, tags, ...metadata } = data
    const id = path.basename(filePath, '.md')
    const parent = null
    const children = async () => {
      return [] as Node[]
    }
    const html = await markdown.to_html(content)
    const text = await markdown.to_text(content)

    return {
      id,
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
}

function parse_tags(tags: string | string[] | null): string[] {
  if (!tags) return []

  if (typeof tags == 'string') return tags.split(',').map((s) => s.trim())

  return tags
}
