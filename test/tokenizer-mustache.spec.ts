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
        lineno: 1,
        value: 'Hello ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: 'newline',
        lineno: 1,
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
        lineno: 1,
        value: 'Hello ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: '!',
      },
      {
        type: 'newline',
        lineno: 1,
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
        lineno: 1,
        value: 'List of users are ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template,
        },
      },
      {
        type: 'raw',
        lineno: 5,
        value: '.',
      },
      {
        type: 'newline',
        lineno: 5,
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
        lineno: 1,
        value: 'List of users are ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 's__mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template,
        },
      },
      {
        type: 'raw',
        lineno: 5,
        value: '.',
      },
      {
        type: 'newline',
        lineno: 5,
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
        lineno: 1,
        value: 'Hello ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', your age is ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
      },
      {
        type: 'newline',
        lineno: 1,
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
        lineno: 1,
        value: 'Hello ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: 'Hello {{ username }}, your friends are {{',
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', your friends are ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template.replace('Hello {{ username }}', '').replace('\nBye', ''),
        },
      },
      {
        type: 'raw',
        lineno: 5,
        value: '!',
      },
      {
        type: 'newline',
        lineno: 5,
      },
      {
        type: 'raw',
        lineno: 6,
        value: 'Bye',
      },
      {
        type: 'newline',
        lineno: 6,
      },
    ])
  })

  test('convert incomplete mustache statements to raw string', (assert) => {
    const template = 'Hello {{ username'

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello {{ username',
      },
      {
        type: 'newline',
        lineno: 1,
      },
    ])
  })

  test('parse 3 mustache statements in a single line', (assert) => {
    const template = dedent`{{ username }}, {{ age }} and {{ state }}`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, {{ age }} and {{ state }}',
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', {{ age }} and {{ state }}',
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ' and ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' state ',
          raw: ' and {{ state }}',
        },
      },
      {
        type: 'newline',
        lineno: 1,
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
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, @{{ age }}',
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'e__mustache',
          jsArg: ' age ',
          raw: ', @{{ age }}',
        },
      },
      {
        type: 'newline',
        lineno: 1,
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
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: '{{ username }}, @{{',
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'e__mustache',
          jsArg: '\n  users.map((user) => user.username)\n',
          raw: ', @{{\n  users.map((user) => user.username)\n}}',
        },
      },
      {
        type: 'newline',
        lineno: 3,
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
        lineno: 1,
        value: 'Hello ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'e__mustache',
          jsArg: ' username ',
          raw: template,
        },
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', your age is ',
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}',
        },
      },
      {
        type: 'newline',
        lineno: 1,
      },
    ])
  })

  test('use raw text when mustache is not closed properly', (assert) => {
    const template = dedent`Hello {{ username }.`

    const tokenizer = new Tokenizer(template, tagsDef, { filename: 'foo.edge' })
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello {{ username }.',
      },
      {
        type: 'newline',
        lineno: 1,
      },
    ])
  })
})
