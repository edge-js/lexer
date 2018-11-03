/**
* edge-lexer
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as dedent from 'dedent'
import { Tokenizer } from '../src/Tokenizer'
import { NodeType } from '../src/Contracts'

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
  each: class Each {
    public static block = true
    public static selfclosed = true
    public static seekable = true
  },
}

test.group('Tokenizer Tags', () => {
  test('tokenize a template into tokens', (assert) => {
    const template = dedent`
    Hello

    @if(username)
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
          raw: 'if(username)',
        },
        lineno: 3,
        children: [],
      },
    ])
  })

  test('add content inside tags as the tag children', (assert) => {
    const template = dedent`
    Hello

    @if(username)
      Hello
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
      {
        type: NodeType.BLOCK,
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.RAW,
            value: '  Hello',
            lineno: 4,
          },
          {
            type: NodeType.NEWLINE,
            lineno: 4,
          },
        ],
      },
    ])
  })

  test('allow nested tags', (assert) => {
    const template = dedent`
    Hello

    @if(username)
      @if(username === 'virk')
        Hi
      @endif
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
      {
        type: NodeType.BLOCK,
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.BLOCK,
            lineno: 4,
            properties: {
              name: 'if',
              jsArg: 'username === \'virk\'',
              raw: 'if(username === \'virk\')',
              selfclosed: false,
            },
            children: [
              {
                type: NodeType.RAW,
                value: '    Hi',
                lineno: 5,
              },
              {
                type: NodeType.NEWLINE,
                lineno: 5,
              },
            ],
          },
        ],
      },
    ])
  })

  test('parse when statement is in multiple lines', (assert) => {
    const template = dedent`
    Hello

    @if(
      username
    )
      Hello
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
      {
        type: NodeType.BLOCK,
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: '\n  username\n',
          raw: 'if(\n  username\n)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.RAW,
            value: '  Hello',
            lineno: 6,
          },
          {
            type: NodeType.NEWLINE,
            lineno: 6,
          },
        ],
      },
    ])
  })

  test('parse when statement is in multiple lines and has internal parens too', (assert) => {
    const template = dedent`
    Hello

    @if((
      2 + 2) * 3 === 12
    )
      Answer is 12
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
      {
        type: NodeType.BLOCK,
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: '(\n  2 + 2) * 3 === 12\n',
          raw: 'if((\n  2 + 2) * 3 === 12\n)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.RAW,
            value: '  Answer is 12',
            lineno: 6,
          },
          {
            type: NodeType.NEWLINE,
            lineno: 6,
          },
        ],
      },
    ])
  })

  test('parse inline tags', (assert) => {
    const template = dedent`@include('partials.user')`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.BLOCK,
        lineno: 1,
        properties: {
          name: 'include',
          jsArg: '\'partials.user\'',
          raw: 'include(\'partials.user\')',
          selfclosed: false,
        },
        children: [],
      },
    ])
  })

  test('parse inline tags which are not seekable', (assert) => {
    const template = dedent`
    @if(username)
      Hello
    @else
      Hello guest
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.BLOCK,
        lineno: 1,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.RAW,
            value: '  Hello',
            lineno: 2,
          },
          {
            type: NodeType.NEWLINE,
            lineno: 2,
          },
          {
            type: NodeType.BLOCK,
            lineno: 3,
            properties: {
              name: 'else',
              jsArg: '',
              raw: 'else',
              selfclosed: false,
            },
            children: [],
          },
          {
            type: NodeType.RAW,
            value: '  Hello guest',
            lineno: 4,
          },
          {
            type: NodeType.NEWLINE,
            lineno: 4,
          },
        ],
      },
    ])
  })

  test('ignore tag when not registered', (assert) => {
    const template = dedent`
    @foo('hello world')
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: '@foo(\'hello world\')',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
    ])
  })

  test('ignore tag when escaped', (assert) => {
    const template = dedent`@@if(username)
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: '@if(username)',
        lineno: 1,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 1,
      },
      {
        type: NodeType.RAW,
        value: '@endif',
        lineno: 2,
      },
      {
        type: NodeType.NEWLINE,
        lineno: 2,
      },
    ])
  })

  test('throw exception when tag is still seeking', (assert) => {
    assert.plan(2)

    const template = dedent`@if((2 + 2)
    @endif`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token ")"')
      assert.equal(line, 1)
    }
  })

  test('consume one liner inline tag', (assert) => {
    const template = `@include('header')`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.BLOCK,
        lineno: 1,
        properties: {
          name: 'include',
          raw: template.replace('@', ''),
          jsArg: '\'header\'',
          selfclosed: false,
        },
        children: [],
      },
    ])
  })

  test('throw exception when there are unclosed tags', (assert) => {
    const template = dedent`
      @if(username)
        Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    const fn = () => tokenizer.parse()
    assert.throw(fn, 'Unclosed tag if')
  })

  test('throw exception when there are unclosed nested tags', (assert) => {
    const template = dedent`
      @if(username)
        @each(user in users)
      @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    const fn = () => tokenizer.parse()
    assert.throw(fn, 'Unclosed tag each')
  })

  test('work fine if a tag is self closed', (assert) => {
    const template = dedent`
    @!each(user in users, include = 'user')
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.BLOCK,
        lineno: 1,
        properties: {
          name: 'each',
          raw: template.replace('@', ''),
          jsArg: `user in users, include = 'user'`,
          selfclosed: true,
        },
        children: [],
      },
    ])
  })

  test('work fine when bang is defined in tag jsArg', (assert) => {
    const template = dedent`
    @if(!user)
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.BLOCK,
        lineno: 1,
        properties: {
          name: 'if',
          raw: 'if(!user)',
          jsArg: `!user`,
          selfclosed: false,
        },
        children: [],
      },
    ])
  })
})
