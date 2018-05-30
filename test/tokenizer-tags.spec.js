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
const Tokenizer = require('../build/Tokenizer')

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
  },
  each: {
    block: true,
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
    const template = dedent`@@if(username)
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

  test('throw exception when there are unclosed tags', (assert) => {
    const template = dedent`
      @if(username)
        Hello world
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    const fn = () => tokenizer.parse()
    assert.throw(fn, 'Unclosed tag if')
  })

  test('throw exception when there are unclosed nested tags', (assert) => {
    const template = dedent`
      @if(username)
        @each(user in users)
      @endif
    `

    const tokenizer = new Tokenizer(template, tagsDef)
    const fn = () => tokenizer.parse()
    assert.throw(fn, 'Unclosed tag each')
  })

  test('work fine if a tag is self closed', (assert) => {
    const template = dedent`
    @!each(user in users, include = 'user')
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
          name: 'each',
          raw: template.replace('@', ''),
          jsArg: `user in users, include = 'user'`
        },
        children: []
      },
      {
        type: 'newline',
        lineno: 1
      }
    ])
  })

  test('work fine when bang is defined in tag jsArg', (assert) => {
    const template = dedent`
    @if(!user)
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
          raw: 'if(!user)',
          jsArg: `!user`
        },
        children: [{
          type: 'newline',
          lineno: 1
        }]
      },
      {
        type: 'newline',
        lineno: 2
      }
    ])
  })
})
