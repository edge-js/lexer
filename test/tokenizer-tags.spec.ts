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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
          raw: 'if(username)',
        },
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 3,
            col: 13,
          },
        },
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 3,
            col: 13,
          },
        },
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
            line: 4,
          },
          {
            type: NodeType.NEWLINE,
            line: 4,
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 3,
            col: 13,
          },
        },
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)',
          selfclosed: false,
        },
        children: [
          {
            type: NodeType.BLOCK,
            loc: {
              start: {
                line: 4,
                col: 6,
              },
              end: {
                line: 4,
                col: 26,
              },
            },
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
                line: 5,
              },
              {
                type: NodeType.NEWLINE,
                line: 5,
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 5,
            col: 1,
          },
        },
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
            line: 6,
          },
          {
            type: NodeType.NEWLINE,
            line: 6,
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 5,
            col: 1,
          },
        },
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
            line: 6,
          },
          {
            type: NodeType.NEWLINE,
            line: 6,
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
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 1,
            col: 25,
          },
        },
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
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 13,
          },
        },
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
            line: 2,
          },
          {
            type: NodeType.NEWLINE,
            line: 2,
          },
          {
            type: NodeType.BLOCK,
            loc: {
              start: {
                line: 3,
                col: 5,
              },
              end: {
                line: 3,
                col: 5,
              },
            },
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
            line: 4,
          },
          {
            type: NodeType.NEWLINE,
            line: 4,
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '@endif',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
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
      assert.equal(line, 2)
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
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 1,
            col: 18,
          },
        },
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
        loc: {
          start: {
            line: 1,
            col: 7,
          },
          end: {
            line: 1,
            col: 39,
          },
        },
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
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 10,
          },
        },
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

test.group('Tokenizer columns', () => {
  test('track whitespaces before the opening parenthesis', (assert) => {
    const template = dedent`
    Hello

    @if  (username)
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
          raw: 'if  (username)',
        },
        loc: {
          start: {
            line: 3,
            col: 6,
          },
          end: {
            line: 3,
            col: 15,
          },
        },
        children: [],
      },
    ])
  })

  test('do not track whitespaces before the closing parenthesis', (assert) => {
    const template = dedent`
    Hello

    @if(username  )
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: 'username  ',
          selfclosed: false,
          raw: 'if(username  )',
        },
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 3,
            col: 15,
          },
        },
        children: [],
      },
    ])
  })

  test('track whitespaces before the starting of tag', (assert) => {
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
          raw: 'if(username)',
        },
        loc: {
          start: {
            line: 3,
            col: 6,
          },
          end: {
            line: 3,
            col: 15,
          },
        },
        children: [],
      },
    ])
  })

  test('track columns for multiline expression', (assert) => {
    const template = dedent`
    Hello

    @if(
      username && age
    )
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
        line: 1,
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
      {
        type: NodeType.RAW,
        value: '',
        line: 2,
      },
      {
        type: NodeType.NEWLINE,
        line: 2,
      },
      {
        type: NodeType.BLOCK,
        properties: {
          name: 'if',
          jsArg: '\n  username && age\n',
          selfclosed: false,
          raw: 'if(\n  username && age\n)',
        },
        loc: {
          start: {
            line: 3,
            col: 4,
          },
          end: {
            line: 5,
            col: 1,
          },
        },
        children: [],
      },
    ])
  })

  test('track columns for mustache statement', (assert) => {
    const template = dedent`
    Hello {{ username }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello ',
        line: 1,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: 'Hello {{ username }}',
        },
        loc: {
          start: {
            line: 1,
            col: 8,
          },
          end: {
            line: 1,
            col: 20,
          },
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
    ])
  })

  test('track columns for multiple mustache statements', (assert) => {
    const template = dedent`
    Hello {{ username }}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello ',
        line: 1,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: 'Hello {{ username }}, your age is {{ age }}',
        },
        loc: {
          start: {
            line: 1,
            col: 8,
          },
          end: {
            line: 1,
            col: 20,
          },
        },
      },
      {
        type: NodeType.RAW,
        value: ', your age is ',
        line: 1,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
        loc: {
          start: {
            line: 1,
            col: 36,
          },
          end: {
            line: 1,
            col: 43,
          },
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
      },
    ])
  })

  test('track columns for multiline mustache statements', (assert) => {
    const template = dedent`
    Hello {{
      username
    }}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello ',
        line: 1,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: '\n  username\n',
          raw: 'Hello {{\n  username\n}}, your age is {{ age }}',
        },
        loc: {
          start: {
            line: 1,
            col: 8,
          },
          end: {
            line: 3,
            col: 2,
          },
        },
      },
      {
        type: NodeType.RAW,
        value: ', your age is ',
        line: 3,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
        loc: {
          start: {
            line: 3,
            col: 18,
          },
          end: {
            line: 3,
            col: 25,
          },
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 3,
      },
    ])
  })

  test('track columns for multiline saf emustache statements', (assert) => {
    const template = dedent`
    Hello {{{
      username
    }}}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: NodeType.RAW,
        value: 'Hello ',
        line: 1,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 's__mustache',
          jsArg: '\n  username\n',
          raw: 'Hello {{{\n  username\n}}}, your age is {{ age }}',
        },
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 3,
            col: 3,
          },
        },
      },
      {
        type: NodeType.RAW,
        value: ', your age is ',
        line: 3,
      },
      {
        type: NodeType.MUSTACHE,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
        loc: {
          start: {
            line: 3,
            col: 19,
          },
          end: {
            line: 3,
            col: 26,
          },
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 3,
      },
    ])
  })
})
