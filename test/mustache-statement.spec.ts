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
import { MustacheStatement } from '../src/MustacheStatement'

test.group('Mustache Statement', () => {
  test('collect expression inside mustache braces', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('{{ 2 + 2 }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: '',
      textRight: '',
      jsArg: ' 2 + 2 ',
      raw: '{{ 2 + 2 }}',
    })
  })

  test('collect expression inside mustache braces with text on left', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('The value is {{ 2 + 2 }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The value is ',
      textRight: '',
      jsArg: ' 2 + 2 ',
      raw: 'The value is {{ 2 + 2 }}',
    })
  })

  test('collect expression inside mustache braces with text on left and right', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('The value is {{ 2 + 2 }}. This is called addition')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'The value is ',
      textRight: '. This is called addition',
      jsArg:  ' 2 + 2 ',
      raw: 'The value is {{ 2 + 2 }}. This is called addition',
    })
  })

  test('collect expression inside mustache when in multiple lines', (assert) => {
    const statement = new MustacheStatement(1, 0)
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
      raw: template,
    })
  })

  test('work fine when there are redundant braces', (assert) => {
    const statement = new MustacheStatement(1, 0)
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
      raw: template,
    })
  })

  test('allow 3 braces for unescaped content', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed(`Welcome {{{ '<span> user </span>' }}}`)

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isNull(statement['internalProps'])
    assert.deepEqual(statement.props, {
      name: 's__mustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: ' \'<span> user </span>\' ',
      raw: `Welcome {{{ '<span> user </span>' }}}`,
    })
  })

  test('multiple mustache should be parsed as raw string', (assert) => {
    const statement = new MustacheStatement(1, 0)
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
      raw: 'Welcome {{ {{ username }} }}',
    })
  })

  test('mixing safe mustache and mustache make statement to keep on seeking', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed(`Welcome {{{ username }}`)

    assert.isTrue(statement.started)
    assert.isFalse(statement.ended)
    assert.isTrue(statement.seeking)
    assert.isNotNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 's__mustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: '',
      raw: 'Welcome {{{ username }}',
    })
  })

  test('ignore escaped mustache braces', (assert) => {
    const statement = new MustacheStatement(1, 0)
    const template = 'Welcome @{{ username }}'
    statement.feed(template)

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isFalse(statement.seeking)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'e__mustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: ' username ',
      raw: 'Welcome @{{ username }}',
    })
  })

  test('ignore escaped safe mustache braces', (assert) => {
    const statement = new MustacheStatement(1, 0)
    const template = 'Welcome @{{{ username }}}'
    statement.feed(template)

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)
    assert.isFalse(statement.seeking)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'es__mustache',
      textLeft: 'Welcome ',
      textRight: '',
      jsArg: ' username ',
      raw: 'Welcome @{{{ username }}}',
    })
  })

  test('do not collect expression when inside single braces', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('{ 2 + 2 }')

    assert.isFalse(statement.started)
    assert.isFalse(statement.ended)

    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: '{ 2 + 2 }',
      textRight: '',
      jsArg: '',
      raw: '{ 2 + 2 }',
    })
  })

  test('set ended as false when safe mustache is not closed properly', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('{{{ 2 + 2 }} is 4')

    assert.isTrue(statement.started)
    assert.isFalse(statement.ended)

    assert.deepEqual(statement.props, {
      name: 's__mustache',
      textLeft: '',
      textRight: '',
      jsArg: '',
      raw: '{{{ 2 + 2 }} is 4',
    })
  })

  test('set ended as false when mustache is not closed properly', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('{{ 2 + 2 } is 4')

    assert.isTrue(statement.started)
    assert.isFalse(statement.ended)

    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: '',
      textRight: '',
      jsArg: '',
      raw: '{{ 2 + 2 } is 4',
    })
  })

  test('track col until the opening brace', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('Hello {{ username }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)

    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'Hello ',
      textRight: '',
      jsArg: ' username ',
      raw: 'Hello {{ username }}',
    })

    assert.deepEqual(statement.loc, {
      start: { line: 1, col: 8 },
      end: { line: 1, col: 20 },
    })
  })

  test('track col for safe mustache', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('Hello {{{ username }}}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)

    assert.deepEqual(statement.props, {
      name: 's__mustache',
      textLeft: 'Hello ',
      textRight: '',
      jsArg: ' username ',
      raw: 'Hello {{{ username }}}',
    })

    assert.deepEqual(statement.loc, {
      start: { line: 1, col: 9 },
      end: { line: 1, col: 22 },
    })
  })

  test('track col for multiple mustache statements', (assert) => {
    const statement = new MustacheStatement(1, 0)
    statement.feed('Hello {{ username }}, your age is {{ age }}')

    assert.isTrue(statement.started)
    assert.isTrue(statement.ended)

    assert.deepEqual(statement.props, {
      name: 'mustache',
      textLeft: 'Hello ',
      textRight: ', your age is {{ age }}',
      jsArg: ' username ',
      raw: 'Hello {{ username }}, your age is {{ age }}',
    })

    assert.deepEqual(statement.loc, {
      start: { line: 1, col: 8 },
      end: { line: 1, col: 20 },
    })
  })
})
