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
import { Tokenizer } from '../src/tokenizer'
import { MustacheTypes } from '../src/types'

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

test.group('Tokenizer Mustache', () => {
  test('process mustache blocks', ({ assert }) => {
    const template = 'Hello {{ username }}'

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
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
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
        properties: {
          jsArg: ' username ',
        },
      },
    ])
  })

  test('process mustache blocks with text around it', ({ assert }) => {
    const template = 'Hello {{ username }}!'

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
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
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
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: '!',
      },
    ])
  })

  test('parse multiline mustache', ({ assert }) => {
    const template = dedent`List of users are {{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 20,
          },
          end: {
            line: 5,
            col: 2,
          },
        },
        properties: {
          jsArg: "\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n",
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 5,
        value: '.',
      },
    ])
  })

  test('Allow safe mustache', ({ assert }) => {
    const template = dedent`List of users are {{{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.SMUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 21,
          },
          end: {
            line: 5,
            col: 3,
          },
        },
        properties: {
          jsArg: "\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n",
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 5,
        value: '.',
      },
    ])
  })

  test('Allow safe escaped mustache', ({ assert }) => {
    const template = dedent`List of users are @{{{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.ESMUSTACHE,
        filename: 'eval.edge',
        loc: {
          start: {
            line: 1,
            col: 22,
          },
          end: {
            line: 5,
            col: 3,
          },
        },
        properties: {
          jsArg: "\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n",
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 5,
        value: '.',
      },
    ])
  })

  test('parse multiple mustache statements in a single line', ({ assert }) => {
    const template = dedent`Hello {{ username }}, your age is {{ age }}`

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
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
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
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ', your age is ',
      },
      {
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
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
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('parse multiple mustache statements in multiple lines', ({ assert }) => {
    const template = dedent`
    Hello {{ username }}, your friends are {{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}!
    Bye
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
        type: MustacheTypes.MUSTACHE,
        filename: 'eval.edge',
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
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ', your friends are ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 41,
          },
          end: {
            line: 5,
            col: 2,
          },
        },
        properties: {
          jsArg: "\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n",
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 5,
        value: '!',
      },
      {
        type: 'newline',
        filename: 'eval.edge',
        line: 5,
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 6,
        value: 'Bye',
      },
    ])
  })

  test('raise error if incomplete mustache statements', ({ assert }) => {
    assert.plan(2)
    const template = 'Hello {{ username'

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token "}"')
      assert.equal(line, 1)
    }
  })

  test('parse 3 mustache statements in a single line', ({ assert }) => {
    const template = dedent`{{ username }}, {{ age }} and {{ state }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)

    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: ', ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 18,
          },
          end: {
            line: 1,
            col: 25,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ' and ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 32,
          },
          end: {
            line: 1,
            col: 41,
          },
        },
        properties: {
          jsArg: ' state ',
        },
      },
    ])
  })

  test('work fine with escaped and regular mustache braces', ({ assert }) => {
    const template = dedent`{{ username }}, @{{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)

    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: ', ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.EMUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 1,
            col: 26,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('work fine with multiline escaped', ({ assert }) => {
    const template = dedent`{{ username }}, @{{
      users.map((user) => user.username)
    }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer.tagStatement)
    assert.isNull(tokenizer.mustacheStatement)

    assert.deepEqual(tokenizer.tokens, [
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: ', ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.EMUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 3,
            col: 2,
          },
        },
        properties: {
          jsArg: '\n  users.map((user) => user.username)\n',
        },
      },
    ])
  })

  test('parse multiple mustache statements when escaped and unescaped', ({ assert }) => {
    const template = dedent`Hello @{{ username }}, your age is {{ age }}`

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
        filename: 'eval.edge',
        type: MustacheTypes.EMUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 1,
            col: 21,
          },
        },
        properties: {
          jsArg: ' username ',
        },
      },
      {
        type: 'raw',
        filename: 'eval.edge',
        line: 1,
        value: ', your age is ',
      },
      {
        filename: 'eval.edge',
        type: MustacheTypes.MUSTACHE,
        loc: {
          start: {
            line: 1,
            col: 37,
          },
          end: {
            line: 1,
            col: 44,
          },
        },
        properties: {
          jsArg: ' age ',
        },
      },
    ])
  })

  test('raise error if mustache is not properly closed', ({ assert }) => {
    assert.plan(2)

    const template = dedent`Hello {{ username }.`
    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'eval.edge' })

    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token "}"')
      assert.equal(line, 1)
    }
  })
})
