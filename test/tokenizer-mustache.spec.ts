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
import { Tokenizer } from '../src/Tokenizer/new'
import { MustacheTypes } from '../src/Contracts'

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
  test('process mustache blocks', (assert) => {
    const template = 'Hello {{ username }}'

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'Hello ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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

  test('process mustache blocks with text around it', (assert) => {
    const template = 'Hello {{ username }}!'

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'Hello ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: '!',
      },
    ])
  })

  test('parse multiline mustache', (assert) => {
    const template = dedent`List of users are {{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
        },
      },
      {
        type: 'raw',
        line: 5,
        value: '.',
      },
    ])
  })

  test('Allow safe mustache', (assert) => {
    const template = dedent`List of users are {{{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.SMUSTACHE,
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
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
        },
      },
      {
        type: 'raw',
        line: 5,
        value: '.',
      },
    ])
  })

  test('Allow safe escaped mustache', (assert) => {
    const template = dedent`List of users are @{{{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}}.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'List of users are ',
      },
      {
        type: MustacheTypes.ESMUSTACHE,
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
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
        },
      },
      {
        type: 'raw',
        line: 5,
        value: '.',
      },
    ])
  })

  test('parse multiple mustache statements in a single line', (assert) => {
    const template = dedent`Hello {{ username }}, your age is {{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'Hello ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: ', your age is ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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

  test('parse multiple mustache statements in multiple lines', (assert) => {
    const template = dedent`
    Hello {{ username }}, your friends are {{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}!
    Bye
    `

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'Hello ',
      },
      {
        type: MustacheTypes.MUSTACHE,
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
        line: 1,
        value: ', your friends are ',
      },
      {
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
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
        },
      },
      {
        type: 'raw',
        line: 5,
        value: '!',
      },
      {
        type: 'newline',
        line: 5,
      },
      {
        type: 'raw',
        line: 6,
        value: 'Bye',
      },
    ])
  })

  test('raise error if incomplete mustache statements', (assert) => {
    assert.plan(2)
    const template = 'Hello {{ username'

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token "}"')
      assert.equal(line, 1)
    }
  })

  test('parse 3 mustache statements in a single line', (assert) => {
    const template = dedent`{{ username }}, {{ age }} and {{ state }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
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
        line: 1,
        value: ', ',
      },
      {
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
        line: 1,
        value: ' and ',
      },
      {
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

  test('work fine with escaped and regular mustache braces', (assert) => {
    const template = dedent`{{ username }}, @{{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
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
        line: 1,
        value: ', ',
      },
      {
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

  test('work fine with multiline escaped', (assert) => {
    const template = dedent`{{ username }}, @{{
      users.map((user) => user.username)
    }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
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
        line: 1,
        value: ', ',
      },
      {
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

  test('parse multiple mustache statements when escaped and unescaped', (assert) => {
    const template = dedent`Hello @{{ username }}, your age is {{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        line: 1,
        value: 'Hello ',
      },
      {
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
        line: 1,
        value: ', your age is ',
      },
      {
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

  test('raise error if mustache is not properly closed', (assert) => {
    assert.plan(2)

    const template = dedent`Hello {{ username }.`
    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })

    try {
      tokenizer.parse()
    } catch ({ message, line }) {
      assert.equal(message, 'Missing token "}"')
      assert.equal(line, 1)
    }
  })
})
