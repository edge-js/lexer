// @ts-check

/**
* edge-lexer
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const test = require('japa')
const dedent = require('dedent')
const Tokenizer = require('../build/Tokenizer').default

const tagsDef = {
  if: {
    block: true,
    seekable: true
  },
  else: {
    block: false,
    seekable: false
  },
  include: {
    block: false,
    seekable: true
  }
}

test.group('Tokenizer', () => {
  test('tokenize a template into tokens', (assert) => {
    const template = dedent`
    Hello

    @if(username)
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: 'Hello',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      },
      {
        type: 'block',
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)'
        },
        lineno: 3,
        children: [
          {
            type: 'newline',
            lineno: 3
          }
        ]
      },
      {
        type: 'newline',
        lineno: 4
      }
    ])
  })

  test('add content inside tags as the tag children', (assert) => {
    const template = dedent`
    Hello

    @if(username)
      Hello
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: 'Hello',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      },
      {
        type: 'block',
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)'
        },
        children: [
          {
            type: 'newline',
            lineno: 3
          },
          {
            type: 'raw',
            value: '  Hello',
            lineno: 4
          },
          {
            type: 'newline',
            lineno: 4
          }
        ]
      },
      {
        type: 'newline',
        lineno: 5
      }
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

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: 'Hello',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      },
      {
        type: 'block',
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)'
        },
        children: [
          {
            type: 'newline',
            lineno: 3
          },
          {
            type: 'block',
            lineno: 4,
            properties: {
              name: 'if',
              jsArg: 'username === \'virk\'',
              raw: 'if(username === \'virk\')'
            },
            children: [
              {
                type: 'newline',
                lineno: 4
              },
              {
                type: 'raw',
                value: '    Hi',
                lineno: 5
              },
              {
                type: 'newline',
                lineno: 5
              }
            ]
          },
          {
            type: 'newline',
            lineno: 6
          }
        ]
      },
      {
        type: 'newline',
        lineno: 7
      }
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

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: 'Hello',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      },
      {
        type: 'block',
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: '\n  username\n',
          raw: 'if(\n  username\n)'
        },
        children: [
          {
            type: 'newline',
            lineno: 5
          },
          {
            type: 'raw',
            value: '  Hello',
            lineno: 6
          },
          {
            type: 'newline',
            lineno: 6
          }
        ]
      },
      {
        type: 'newline',
        lineno: 7
      }
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

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: 'Hello',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      },
      {
        type: 'block',
        lineno: 3,
        properties: {
          name: 'if',
          jsArg: '(\n  2 + 2) * 3 === 12\n',
          raw: 'if((\n  2 + 2) * 3 === 12\n)'
        },
        children: [
          {
            type: 'newline',
            lineno: 5
          },
          {
            type: 'raw',
            value: '  Answer is 12',
            lineno: 6
          },
          {
            type: 'newline',
            lineno: 6
          }
        ]
      },
      {
        type: 'newline',
        lineno: 7
      }
    ])
  })

  test('parse inline tags', (assert) => {
    const template = dedent`@include('partials.user')`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'block',
        lineno: 1,
        properties: {
          name: 'include',
          jsArg: '\'partials.user\'',
          raw: 'include(\'partials.user\')'
        },
        children: []
      },
      {
        type: 'newline',
        lineno: 1
      }
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

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'block',
        lineno: 1,
        properties: {
          name: 'if',
          jsArg: 'username',
          raw: 'if(username)'
        },
        children: [
          {
            type: 'newline',
            lineno: 1
          },
          {
            type: 'raw',
            value: '  Hello',
            lineno: 2
          },
          {
            type: 'newline',
            lineno: 2
          },
          {
            type: 'block',
            lineno: 3,
            properties: {
              name: 'else',
              jsArg: '',
              raw: 'else'
            },
            children: []
          },
          {
            type: 'newline',
            lineno: 3
          },
          {
            type: 'raw',
            value: '  Hello guest',
            lineno: 4
          },
          {
            type: 'newline',
            lineno: 4
          }
        ]
      },
      {
        type: 'newline',
        lineno: 5
      }
    ])
  })

  test('ignore tag when not registered', (assert) => {
    const template = dedent`
    @foo('hello world')
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: '@foo(\'hello world\')',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('ignore tag when escaped', (assert) => {
    const template = dedent`
    \@if(username)
    @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: '@if(username)',
        lineno: 1
      },
      {
        type: 'newline',
        lineno: 1
      },
      {
        type: 'raw',
        value: '@endif',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      }
    ])
  })

  test('convert tag to raw string when statement is still seeking', (assert) => {
    const template = dedent`@if((2 + 2)
    @endif`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        value: '@if((2 + 2)\n@endif',
        lineno: 2
      },
      {
        type: 'newline',
        lineno: 2
      }
    ])
  })

  test('consume one liner inline tag', (assert) => {
    const template = `@include('header')`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'block',
        lineno: 1,
        properties: {
          name: 'include',
          raw: template.replace('@', ''),
          jsArg: '\'header\''
        },
        children: []
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('process mustache blocks', (assert) => {
    const template = 'Hello {{ username }}'

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template
        }
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('process mustache blocks with text around it', (assert) => {
    const template = 'Hello {{ username }}!'

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: '!'
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('parse multiline mustache', (assert) => {
    const template = dedent`List of users are {{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}.`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'List of users are '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template
        }
      },
      {
        type: 'raw',
        lineno: 5,
        value: '.'
      },
      {
        type: 'newline',
        lineno: 5
      }
    ])
  })

  test('Allow safe mustache', (assert) => {
    const template = dedent`List of users are {{{
      users.map((user) => {
        return user.username
      }).join(', ')
    }}}.`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'List of users are '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 's__mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template
        }
      },
      {
        type: 'raw',
        lineno: 5,
        value: '.'
      },
      {
        type: 'newline',
        lineno: 5
      }
    ])
  })

  test('parse multiple mustache statements in a single line', (assert) => {
    const template = dedent`Hello {{ username }}, your age is {{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: template
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', your age is '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', your age is {{ age }}'
        }
      },
      {
        type: 'newline',
        lineno: 1
      }
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

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])

    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' username ',
          raw: 'Hello {{ username }}, your friends are {{'
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', your friends are '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(', ')\n`,
          raw: template.replace('Hello {{ username }}', '').replace('\nBye', '')
        }
      },
      {
        type: 'raw',
        lineno: 5,
        value: '!'
      },
      {
        type: 'newline',
        lineno: 5
      },
      {
        type: 'raw',
        lineno: 6,
        value: 'Bye'
      },
      {
        type: 'newline',
        lineno: 6
      }
    ])
  })

  test('convert incomplete mustache statements to raw string', (assert) => {
    const template = 'Hello {{ username'

    const tokenizer = new Tokenizer(template, tagsDef)
    tokenizer.parse()

    assert.isNull(tokenizer['blockStatement'])
    assert.isNull(tokenizer['mustacheStatement'])
    assert.deepEqual(tokenizer.tokens, [
      {
        type: 'raw',
        lineno: 1,
        value: 'Hello {{ username'
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('parse 3 mustache statements in a single line', (assert) => {
    const template = dedent`{{ username }}, {{ age }} and {{ state }}`

    const tokenizer = new Tokenizer(template, tagsDef)
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
          raw: '{{ username }}, {{ age }} and {{ state }}'
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' age ',
          raw: ', {{ age }} and {{ state }}'
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ' and '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'mustache',
          jsArg: ' state ',
          raw: ' and {{ state }}'
        }
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('work fine with escaped and regular mustache braces', (assert) => {
    const template = dedent`{{ username }}, @{{ age }}`

    const tokenizer = new Tokenizer(template, tagsDef)
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
          raw: '{{ username }}, @{{ age }}'
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'e__mustache',
          jsArg: ' age ',
          raw: ', @{{ age }}'
        }
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('work fine with multiline escaped', (assert) => {
    const template = dedent`{{ username }}, @{{
      users.map((user) => user.username)
    }}`

    const tokenizer = new Tokenizer(template, tagsDef)
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
          raw: '{{ username }}, @{{'
        }
      },
      {
        type: 'raw',
        lineno: 1,
        value: ', '
      },
      {
        type: 'mustache',
        lineno: 1,
        properties: {
          name: 'e__mustache',
          jsArg: '\n  users.map((user) => user.username)\n',
          raw: ', @{{\n  users.map((user) => user.username)\n}}'
        }
      },
      {
        type: 'newline',
        lineno: 3
      }
    ])
  })
})
