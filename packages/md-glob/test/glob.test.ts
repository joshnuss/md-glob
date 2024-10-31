import { describe, test, expect } from 'vitest'
import { glob } from '../src/index.js'

describe('glob', () => {
  const docs = glob('test/fixtures/docs/**/*.md')

  test('has roots', async () => {
    const nodes = await docs.roots()

    expect(nodes.length).toBe(3)

    const node = nodes[0]

    expect(node.id).toBe('example')
    expect(node.type).toBe('file')
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
    expect(node.children).toEqual([])
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
      expect(doc?.type).toBe('directory')
      expect(doc?.title).toBe('Intro index page')
      expect(doc?.text).toBe('This is the intro page\n')
    })

    test('root node', async () => {
      const root = await docs.root()

      expect(root).toBeTruthy()
    })

    describe('parent', () => {
      test('when parent requested on node, parent is defined', async () => {
        const parent = await docs.get('intro')

        const doc = await docs.get('intro/overview.md', {
          include: {
            parent: true
          }
        })

        if (!doc) throw Error('missing doc')

        expect(doc.parent).toStrictEqual(parent)
        expect(await docs.parent('intro/overview.md')).toStrictEqual(parent)
      })

      test('when parent requested on dir, parent is defined', async () => {
        const parent = await docs.get('intro')

        const doc = await docs.get('intro/tutorial', {
          include: {
            parent: true
          }
        })

        if (!doc) throw Error('missing doc')

        expect(doc.parent).toStrictEqual(parent)
        expect(await docs.parent('intro/tutorial')).toStrictEqual(parent)
      })

      test('when root node, parent is null', async () => {
        const doc = await docs.get('intro', {
          include: {
            parent: true
          }
        })

        if (!doc) throw Error('missing doc')

        expect(doc.parent).toBeNull()
      })
    })

    describe('children', () => {
      test('when directory has children, gets children', async () => {
        const parent = await docs.get('intro/tutorial', {
          include: {
            children: true
          }
        })

        const child = await docs.get('intro/tutorial/first')

        if (!parent) throw Error('missing parent')

        expect(parent.children).toStrictEqual([child])
        expect(await docs.children('intro/tutorial')).toStrictEqual([child])
      })

      test('when directory is empty, gets empty list of children', async () => {
        const empty = await docs.get('empty', {
          include: {
            children: true
          }
        })

        if (!empty) throw Error('missing folder')

        expect(empty.children).toStrictEqual([])
        expect(await docs.children('empty')).toStrictEqual([])
      })

      test('when file, gets empty list of children', async () => {
        const doc = await docs.get('intro/tutorial/first', {
          include: {
            children: true
          }
        })

        if (!doc) throw Error('missing doc')

        expect(doc.children).toStrictEqual([])
        expect(await docs.children('intro/tutorial/first')).toStrictEqual([])
      })
    })
  })
})
