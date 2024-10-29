import { remark } from 'remark'
import strip from 'strip-markdown'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

import type { PluggableList } from 'unified'

export async function to_html(source: string): Promise<string> {
  return process(source, [remarkRehype, rehypeStringify])
}

export async function to_text(source: string): Promise<string> {
  return process(source, [strip])
}

async function process(source: string, plugins: PluggableList): Promise<string> {
  const file = await remark().use(plugins).process(source)

  return String(file)
}
