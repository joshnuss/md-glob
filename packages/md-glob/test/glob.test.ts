import { describe, test, expect } from 'vitest'
import { glob } from '../src/index.js'

describe('glob', () => {
  const docs = glob('test/fixtures/docs/**/*.md')

  test('has children', async () => {
    const nodes = await docs.children()

    expect(nodes.length).toBe(3)

    const node = nodes[0]

    expect(node.id).toBe('example')
    expect(node.title).toBe('Example')
    expect(node.summary).toBe('This is a summary')
    expect(node.author).toBe('Josh')
    expect(node.metadata).toEqual({ extra1: 42, extra2: 'more' })
    expect(node.date).toEqual(new Date(Date.UTC(2024, 9, 1)))
    expect(node.tags).toEqual([])
    expect(node.content).toBe('\nHello World!\n')
    expect(node.html).toBe('<p>Hello World!</p>')
    expect(node.text).toBe('Hello World!\n')
    expect(node.parent).toBe(null)
  })

  describe('get', () => {
    test('when file exists', async () => {
      const example = await docs.get('example')

      expect(example?.id).toBe('example')
    })

    test('when file exists, with .md extension', async () => {
      const example = await docs.get('example.md')

      expect(example?.id).toBe('example')
    })

    test('when file is missing', async () => {
      const missing = await docs.get('unknown-doc')

      expect(missing).toBeNull()
    })
  })

  describe('tags', () => {
    test('tags can be a comma-separated string', async () => {
      const doc = await docs.get('tag-strings')

      expect(doc?.tags).toEqual(['react', 'vue', 'svelte'])
    })

    test('tags can be a list', async () => {
      const doc = await docs.get('tag-list')

      expect(doc?.tags).toEqual(['wip', 'react', 'vue', 'svelte'])
    })

    test('has list of tags', async () => {
      const tags = await docs.tags()

      expect(tags).toEqual({
        react: 2,
        vue: 2,
        svelte: 2,
        wip: 1
      })
    })
  })

  describe('hierarchies', () => {
    test('when dir/index.md is defined, uses that', async () => {
      const doc = await docs.get('intro')

      expect(doc?.id).toBe('intro')
      expect(doc?.title).toBe('Intro index page')
    })

    test('when child node, parent is defined', async () => {
      const parent = await docs.get('example/intro')
      const doc = await docs.get('example/intro/overview.md')

      expect(doc?.parent).toBe(parent)
    })

    test('when root node, parent is null')
  })
})
