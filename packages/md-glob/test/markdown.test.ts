import { describe, test, expect } from 'vitest'
import * as markdown from '../src/markdown'

describe('markdown', () => {
  test('convert to html', async () => {
    const html = await markdown.to_html('# hello')

    expect(html).toBe('<h1>hello</h1>')
  })

  test('convert to text', async () => {
    const text = await markdown.to_text('# hello')

    expect(text).toBe('hello\n')
  })
})
