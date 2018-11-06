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
        type: NodeType.RAW,
        line: 1,
        value: 'Hello ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        type: NodeType.RAW,
        line: 1,
        value: 'Hello ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: '!',
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        type: NodeType.RAW,
        line: 1,
        value: 'List of users are ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template,
        },
      },
      {
        type: NodeType.RAW,
        line: 5,
        value: '.',
      },
      {
        type: NodeType.NEWLINE,
        line: 5,
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
        type: NodeType.RAW,
        line: 1,
        value: 'List of users are ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 's__mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template,
        },
      },
      {
        type: NodeType.RAW,
        line: 5,
        value: '.',
      },
      {
        type: NodeType.NEWLINE,
        line: 5,
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
        type: NodeType.RAW,
        line: 1,
        value: 'Hello ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', your age is ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        type: NodeType.RAW,
        line: 1,
        value: 'Hello ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: 'Hello {{ username }}, your friends are {{',
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', your friends are ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template.replace('Hello {{ username }}', '').replace('\nBye', ''),
        },
      },
      {
        type: NodeType.RAW,
        line: 5,
        value: '!',
      },
      {
        type: NodeType.NEWLINE,
        line: 5,
      },
      {
        type: NodeType.RAW,
        line: 6,
        value: 'Bye',
      },
      {
        type: NodeType.NEWLINE,
        line: 6,
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
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, {{ age }} and {{ state }}',
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' age ',
          raw: ', {{ age }} and {{ state }}',
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ' and ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' state ',
          raw: ' and {{ state }}',
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, @{{ age }}',
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'e__mustache',
          jsArg: ' age ',
          raw: ', @{{ age }}',
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, @{{',
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'e__mustache',
          jsArg: '\n  users.map((user) => user.username)\n',
          raw: ', @{{\n  users.map((user) => user.username)\n}}',
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 3,
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
        type: NodeType.RAW,
        line: 1,
        value: 'Hello ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'e__mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: NodeType.RAW,
        line: 1,
        value: ', your age is ',
      },
      {
        type: NodeType.MUSTACHE,
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
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
      },
      {
        type: NodeType.NEWLINE,
        line: 1,
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
