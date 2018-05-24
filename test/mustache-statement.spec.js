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
const MustacheStatement = require('../build/MustacheStatement').default

test.group('Mustache Statement', () => {
  test('collect expression inside mustache braces', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed('{{ 2 + 2 }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: '',
      textRight: '',
      jsArg: ' 2 + 2 ',
      raw: '{{ 2 + 2 }}'
    })
  })

  test('collect expression inside mustache braces with text on left', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed('The value is {{ 2 + 2 }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The value is ',
      textRight: '',
      jsArg: ' 2 + 2 ',
      raw: 'The value is {{ 2 + 2 }}'
    })
  })

  test('collect expression inside mustache braces with text on left and right', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed('The value is {{ 2 + 2 }}. This is called addition')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The value is ',
      textRight: '. This is called addition',
      jsArg:  ' 2 + 2 ',
      raw: 'The value is {{ 2 + 2 }}. This is called addition'
    })
  })

  test('collect expression inside mustache when in multiple lines', (assert) => {
    const statement = new MustacheStatement(1)
    const template = dedent`
    The users are {{
      users.map((user) => {
        return user.username
      }).join(',')
    }}
    `

    template.split('\n').forEach((line) => statement.feed(line))

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The users are ',
      textRight: '',
      jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(',')\n`,
      raw: template
    })
  })

  test('work fine when there are redundant braces', (assert) => {
    const statement = new MustacheStatement(1)
    const template = dedent`
    The users are {{
      users.map((user) => {
        return user.username
      }).join(',')
    }}}
    `

    template.split('\n').forEach((line) => statement.feed(line))

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The users are ',
      textRight: '}',
      jsArg: `\n  users.map((user) => {\n    return user.username\n  }).join(',')\n`,
      raw: template
    })
  })

  test('allow 3 braces for unescaped content', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed(`Welcome {{{ '<span> user </span>' }}}`)

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'emustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: ' \'<span> user </span>\' ',
      raw: `Welcome {{{ '<span> user </span>' }}}`
    })
  })

  test('do not close when didn\'t started', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed(`Welcome dude }}}`)

    assert.isFalse(statement.started)
    assert.isFalse(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: '',
      textLeft: 'Welcome dude }}}',
      textRight: '',
      jsArg: '',
      raw: 'Welcome dude }}}'
    })
  })

  test('multiple mustache should be parsed as raw string', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed(`Welcome {{ {{ username }} }}`)

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isFalse(statement.seeking)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: ' {{ username }} ',
      raw: 'Welcome {{ {{ username }} }}'
    })
  })

  test('mixing emustache and mustache make statement to keep on seeking', (assert) => {
    const statement = new MustacheStatement(1)
    statement.feed(`Welcome {{{ username }}`)

    assert.isTrue(statement.started)
    assert.isFalse(statement.ended)
    assert.isTrue(statement.seeking)
    assert.isNotNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'emustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: '',
      raw: 'Welcome {{{ username }}'
    })
  })
})
