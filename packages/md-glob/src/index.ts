import { Glob } from './glob.js'

export { Glob }

export interface Node {
  id: string
  type: 'file' | 'directory',
  title: string
  summary: string | null
  author: string | null
  date: Date | null
  tags: string[]
  metadata: Record<string, any>
  content: string
  html: string
  text: string
  parent: Node | null
  children: Node[]
}

export function glob(pattern: string): Glob {
  return new Glob(pattern)
}
