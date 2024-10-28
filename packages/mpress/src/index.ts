import { Dir } from './dir.js'

export { Dir }

export interface Node {
  id: string
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
}

export function dir(path: string): Dir {
  return new Dir(path)
}
