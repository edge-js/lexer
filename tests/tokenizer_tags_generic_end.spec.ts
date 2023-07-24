/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import dedent from 'dedent'
import { Tokenizer } from '../src/tokenizer.js'
import { TagTypes, MustacheTypes } from '../src/types.js'

const tagsDef = {
  if: class If {
    static block = true
    static seekable = true
  },
  else: class Else {
    static block = false
    static seekable = false
  },
  include: class Include {
    static block = false
    static seekable = true
  },
  each: class Each {
    static block = true
    static seekable = true
  },
}

test.group('Tokenizer Tags', () => {
  test('tokenize a template into tokens', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
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

  test('add content inside tags as the tag children', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)
      Hello
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 3,
          },
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 4,
          },
        ],
      },
    ])
  })

  test('allow nested tags', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)
      @if(username === 'virk')
        Hi
      @end
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 3,
          },
          {
            type: TagTypes.TAG,
            filename: 'eval.edge',
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
              jsArg: "username === 'virk'",
              selfclosed: false,
            },
            children: [
              {
                type: 'newline',
                filename: 'eval.edge',
                line: 4,
              },
              {
                type: 'raw',
                filename: 'eval.edge',
                value: '    Hi',
                line: 5,
              },
            ],
          },
        ],
      },
    ])
  })

  test('parse when statement is in multiple lines', ({ assert }) => {
    const template = dedent`
    Hello

    @if(
      username
    )
      Hello
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 5,
          },
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 6,
          },
        ],
      },
    ])
  })

  test('parse when statement is in multiple lines and has internal parens too', ({ assert }) => {
    const template = dedent`
    Hello

    @if((
      2 + 2) * 3 === 12
    )
      Answer is 12
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 5,
          },
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Answer is 12',
            line: 6,
          },
        ],
      },
    ])
  })

  test('parse inline tags', ({ assert }) => {
    const template = dedent`@include('partials.user')`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          jsArg: "'partials.user'",
          selfclosed: false,
        },
        children: [],
      },
    ])
  })

  test('parse inline tags which are not seekable', ({ assert }) => {
    const template = dedent`
    @if(username)
      Hello
    @else
      Hello guest
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 1,
          },
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 2,
          },
          {
            filename: 'eval.edge',
            type: TagTypes.TAG,
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
              selfclosed: false,
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
            value: '  Hello guest',
            line: 4,
          },
        ],
      },
    ])
  })

  test('ignore tag when not registered', ({ assert }) => {
    const template = dedent`
    @foo('hello world')
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: "@foo('hello world')",
        line: 1,
      },
    ])
  })

  test('ignore tag when escaped', ({ assert }) => {
    const template = dedent`@@if(username)
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.ETAG,
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 5,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        children: [],
      },
    ])
  })

  test('throw exception when tag is still seeking', ({ assert }) => {
    assert.plan(2)

    const template = dedent`@if((2 + 2)
    @end`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token ")"')
      assert.equal(line, 1)
    }
  })

  test('throw exception when there is inline content in the tag opening statement', ({
    assert,
  }) => {
    assert.plan(3)
    const template = dedent`@include('foo') hello world`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line, col }) {
      assert.equal(message, 'Unexpected token " hello world"')
      assert.equal(line, 1)
      assert.equal(col, 15)
    }
  })

  test('throw exception when opening brace is in a different line', ({ assert }) => {
    assert.plan(3)
    const template = dedent`
    @if
    (
      username
    )
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line, col }) {
      assert.equal(message, 'Missing token "("')
      assert.equal(line, 1)
      assert.equal(col, 3)
    }
  })

  test('do not raise exception when tag is not seekable and has no parens', ({ assert }) => {
    const template = dedent`
    @else
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
        properties: {
          name: 'else',
          jsArg: '',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 5,
          },
          end: {
            line: 1,
            col: 5,
          },
        },
        children: [],
      },
    ])
  })

  test('consume one liner inline tag', ({ assert }) => {
    const template = "@include('header')"

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          jsArg: "'header'",
          selfclosed: false,
        },
        children: [],
      },
    ])
  })

  test('throw exception when there are unclosed tags', ({ assert }) => {
    const template = dedent`
      @if(username)
        Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    const fn = () => tokenizer.parse()
    assert.throws(fn, 'Unclosed tag if')
  })

  test('throw exception when there are unclosed nested tags', ({ assert }) => {
    const template = dedent`
      @if(username)
        @each(user in users)
      @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    const fn = () => tokenizer.parse()
    assert.throws(fn, 'Unclosed tag if')
  })

  test('handle when nested components are closed using generic end', ({ assert }) => {
    const template = dedent`
      @if(username)
				@each(user in users)
				@end
      @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()
    assert.isNull(tokenizer.tagStatement)

    assert.deepEqual(tokenizer.tokens, [
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'newline',
            filename: 'eval.edge',
            line: 1,
          },
          {
            type: TagTypes.TAG,
            filename: 'eval.edge',
            loc: {
              start: {
                line: 2,
                col: 10,
              },
              end: {
                line: 2,
                col: 24,
              },
            },
            properties: {
              name: 'each',
              jsArg: 'user in users',
              selfclosed: false,
            },
            children: [],
          },
        ],
      },
    ])
  })

  test('work fine if a tag is self closed', ({ assert }) => {
    const template = dedent`
    @!each(user in users, include = 'user')
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          jsArg: "user in users, include = 'user'",
          selfclosed: true,
        },
        children: [],
      },
    ])
  })

  test('work fine when bang is defined in tag jsArg', ({ assert }) => {
    const template = dedent`
    @if(!user)
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
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
          jsArg: '!user',
          selfclosed: false,
        },
        children: [],
      },
    ])
  })

  test('remove newline after the tag', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)~
      Hello
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 4,
          },
        ],
      },
    ])
  })

  test('remove newline after the tag spanned over multiple lines', ({ assert }) => {
    const template = dedent`
    Hello

    @if(
      username
    )~
      Hello
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 6,
          },
        ],
      },
    ])
  })

  test('remove newline between two tags', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)~
      @if(age)
      Hello
      @end
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: TagTypes.TAG,
            filename: 'eval.edge',
            loc: {
              start: {
                line: 4,
                col: 6,
              },
              end: {
                line: 4,
                col: 10,
              },
            },
            properties: {
              name: 'if',
              jsArg: 'age',
              selfclosed: false,
            },
            children: [
              {
                type: 'newline',
                filename: 'eval.edge',
                line: 4,
              },
              {
                type: 'raw',
                filename: 'eval.edge',
                value: '  Hello',
                line: 5,
              },
            ],
          },
        ],
      },
    ])
  })

  test('remove newline between two tags when spanned over multiple lines', ({ assert }) => {
    const template = dedent`
    Hello

    @if(
      username
    )~
      @if(age)
      Hello
      @end
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: TagTypes.TAG,
            filename: 'eval.edge',
            loc: {
              start: {
                line: 6,
                col: 6,
              },
              end: {
                line: 6,
                col: 10,
              },
            },
            properties: {
              name: 'if',
              jsArg: 'age',
              selfclosed: false,
            },
            children: [
              {
                type: 'newline',
                filename: 'eval.edge',
                line: 6,
              },
              {
                type: 'raw',
                filename: 'eval.edge',
                value: '  Hello',
                line: 7,
              },
            ],
          },
        ],
      },
    ])
  })

  test('remove newline after the tag when tag has noNewLine property', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username)
      Hello
    @end
    `

    const tags = {
      if: class If {
        static block = true
        static seekable = true
        static noNewLine = true
      },
    }

    const tokenizer = new Tokenizer(template, tags, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 4,
          },
        ],
      },
    ])
  })

  test('remove newline between two tags when tag has noNewLine property', ({ assert }) => {
    const template = dedent`
    Hello

    @if(
      username
    )
      @if(age)
      Hello
      @end
    @end
    `

    const tags = {
      if: class If {
        static block = true
        static seekable = true
        static noNewLine = true
      },
    }

    const tokenizer = new Tokenizer(template, tags, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: TagTypes.TAG,
            filename: 'eval.edge',
            loc: {
              start: {
                line: 6,
                col: 6,
              },
              end: {
                line: 6,
                col: 10,
              },
            },
            properties: {
              name: 'if',
              jsArg: 'age',
              selfclosed: false,
            },
            children: [
              {
                type: 'raw',
                filename: 'eval.edge',
                value: '  Hello',
                line: 7,
              },
            ],
          },
        ],
      },
    ])
  })

  test('remove newline after the endblock', ({ assert }) => {
    const template = dedent`
    @if(username)~
      Hello
    @end~
    world
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: TagTypes.TAG,
        filename: 'eval.edge',
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
          selfclosed: false,
        },
        children: [
          {
            type: 'raw',
            filename: 'eval.edge',
            value: '  Hello',
            line: 2,
          },
        ],
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'world',
        line: 4,
      },
    ])
  })
})

test.group('Tokenizer columns', () => {
  test('track whitespaces before the opening parenthesis', ({ assert }) => {
    const template = dedent`
    Hello

    @if  (username)
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
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

  test('do not track whitespaces before the closing parenthesis', ({ assert }) => {
    const template = dedent`
    Hello

    @if(username  )
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
        properties: {
          name: 'if',
          jsArg: 'username  ',
          selfclosed: false,
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

  test('track whitespaces before the starting of tag', ({ assert }) => {
    const template = dedent`
    Hello

      @if(username)
      @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
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

  test('track columns for multiline expression', ({ assert }) => {
    const template = dedent`
    Hello

    @if(
      username && age
    )
    @end
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello',
        line: 1,
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        value: '',
        line: 2,
      },
      {
        filename: 'eval.edge',
        type: TagTypes.TAG,
        properties: {
          name: 'if',
          jsArg: '\n  username && age\n',
          selfclosed: false,
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

  test('track columns for mustache statement', ({ assert }) => {
    const template = dedent`
    Hello {{ username }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: ' username ',
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
    ])
  })

  test('track columns for multiple mustache statements', ({ assert }) => {
    const template = dedent`
    Hello {{ username }}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: ' username ',
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
        type: 'raw',
        filename: 'eval.edge',
        value: ', your age is ',
        line: 1,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: ' age ',
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
    ])
  })

  test('track columns for multiline mustache statements', ({ assert }) => {
    const template = dedent`
    Hello {{
      username
    }}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: '\n  username\n',
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
        type: 'raw',
        filename: 'eval.edge',
        value: ', your age is ',
        line: 3,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: ' age ',
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
    ])
  })

  test('track columns for multiline saf emustache statements', ({ assert }) => {
    const template = dedent`
    Hello {{{
      username
    }}}, your age is {{ age }}
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        value: 'Hello ',
        line: 1,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.SMUSTACHE,
        properties: {
          jsArg: '\n  username\n',
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
        type: 'raw',
        filename: 'eval.edge',
        value: ', your age is ',
        line: 3,
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: ' age ',
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
    ])
  })
})
