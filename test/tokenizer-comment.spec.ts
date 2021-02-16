/**
 * edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import dedent from 'dedent'
import { Tokenizer } from '../src/Tokenizer'
import { MustacheTypes, TagTypes } from '../src/Contracts'

const tagsDef = {
  if: class If {
    public static block = true
    public static selfclosed = false
    public static seekable = true
  },
  else: class Else {
    public static block = false
    public static selfclosed = false
    public static seekable = false
  },
  include: class Include {
    public static block = false
    public static selfclosed = false
    public static seekable = true
  },
}

test.group('Tokenizer Comment', () => {
  test('process block level comments', (assert) => {
    const template = dedent`
    {{-- This is a comment --}}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 27,
          },
        },
        value: ' This is a comment ',
      },
    ])
  })

  test('process block level comments spanned to multiple lines', (assert) => {
    const template = dedent`
    {{--
       This is a comment
    --}}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n   This is a comment\n',
      },
    ])
  })

  test('process inline comments with text', (assert) => {
    const template = dedent`
    Hello {{-- This is inline comment --}}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'Hello ',
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 10,
          },
          end: {
            line: 1,
            col: 38,
          },
        },
        value: ' This is inline comment ',
      },
    ])
  })

  test('process inline comments with mustache', (assert) => {
    const template = dedent`
    {{ username }} {{-- This is an inline comment --}}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 1,
            col: 50,
          },
        },
        value: ' This is an inline comment ',
      },
    ])
  })

  test('process inline comments spanning over multiple lines with mustache', (assert) => {
    const template = dedent`
    {{ username }} {{--
      This is an inline comment
    --}}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
    ])
  })

  test('process inline comments surrounded by interpolation braces', (assert) => {
    const template = dedent`
    {{ username }} {{-- This is an inline comment --}} {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 1,
            col: 50,
          },
        },
        value: ' This is an inline comment ',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 53,
          },
          end: {
            line: 1,
            col: 60,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('process inline comments spanning over multiple lines surrounded by interpolation braces', (assert) => {
    const template = dedent`
    {{ username }} {{--
      This is an inline comment
    --}} {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 3,
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 3,
            col: 7,
          },
          end: {
            line: 3,
            col: 14,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('process inline comments surrounded by text', (assert) => {
    const template = dedent`
    Hello {{-- This is inline comment --}} world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'Hello ',
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 10,
          },
          end: {
            line: 1,
            col: 38,
          },
        },
        value: ' This is inline comment ',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ' world',
      },
    ])
  })

  test('process inline comments spanning over multiple lines surrounded by text', (assert) => {
    const template = dedent`
    Hello {{--
      This is inline comment
    --}} world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'Hello ',
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 10,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is inline comment\n',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 3,
        value: ' world',
      },
    ])
  })

  test('disallow inline comments with tags', (assert) => {
    const template = dedent`
    @if(username) {{-- This is a comment --}}
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    const fn = () => tokenizer.parse()
    assert.throw(fn, 'Unexpected token " {{-- This is a comment --}}"')
  })

  test('shrink newlines after block level comments', (assert) => {
    const template = dedent`
    {{-- This is a comment --}}
    Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 27,
          },
        },
        value: ' This is a comment ',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 2,
        value: 'Hello world',
      },
    ])
  })

  test('do not shrink newlines for inline comments', (assert) => {
    const template = dedent`
    Hey {{-- This is a comment --}}
    Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'Hey ',
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 8,
          },
          end: {
            line: 1,
            col: 31,
          },
        },
        value: ' This is a comment ',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 2,
        value: 'Hello world',
      },
    ])
  })

  test('do not shrink newlines for inline comments when raw text is after the comment', (assert) => {
    const template = dedent`
    {{-- This is a comment --}} Hey
    Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 27,
          },
        },
        value: ' This is a comment ',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ' Hey',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 2,
        value: 'Hello world',
      },
    ])
  })

  test('do not shrink newlines when comment is next to an interpolation brace', (assert) => {
    const template = dedent`
    {{-- This is a comment --}} {{ username }}
    Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 27,
          },
        },
        value: ' This is a comment ',
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ' ',
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 30,
          },
          end: {
            line: 1,
            col: 42,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 2,
        value: 'Hello world',
      },
    ])
  })

  test('do not shrink newlines when comment spanned over multiple lines, after interpolation brace', (assert) => {
    const template = dedent`
    {{ username }} {{--
      This is an inline comment
    --}}
    {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    // console.log(JSON.stringify(tokenizer.tokens, null, 2))

    assert.deepEqual(tokenizer.tokens, [
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: ' ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 3,
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 4,
            col: 2,
          },
          end: {
            line: 4,
            col: 9,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('do shrink comment spanned over multiple lines', (assert) => {
    const template = dedent`
    {{--
      This is an inline comment
    --}}
    {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 3,
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 4,
            col: 2,
          },
          end: {
            line: 4,
            col: 9,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('do not shrink newlines when comment spanned over multiple lines, after raw text', (assert) => {
    const template = dedent`
    Hello {{--
      This is an inline comment
    --}}
    {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 10,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 3,
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 4,
            col: 2,
          },
          end: {
            line: 4,
            col: 9,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])

    const templateWithRawTextAround = dedent`
    Hello {{--
      This is an inline comment
    --}}
    world
    `

    const tokenizer1 = new Tokenizer(templateWithRawTextAround, tagsDef, { filename: 'eval.edge' })
    tokenizer1.parse()

    assert.isNull(tokenizer1.tagStatement)
    assert.isNull(tokenizer1.mustacheStatement)
    assert.deepEqual(tokenizer1.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 10,
          },
          end: {
            line: 3,
            col: 4,
          },
        },
        value: '\n  This is an inline comment\n',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 3,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'world',
        line: 4,
      },
    ])
  })

  test('do not emit newline when firstline is a comment', (assert) => {
    const template = dedent`
    {{-- This is a comment --}}
    @if(username)
    @endif
    Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'comment',
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 27,
          },
        },
        value: ' This is a comment ',
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 2,
            col: 4,
          },
          end: {
            line: 2,
            col: 13,
          },
        },
        children: [],
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 3,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 4,
        value: 'Hello world',
      },
    ])
  })
})
