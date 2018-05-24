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
const TagStatement = require('../build/TagStatement').default

test.group('Statement', () => {
  test('tokenize all chars of a statement', (assert) => {
    const statement = new TagStatement(1)
    statement.feed('if(username)')

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.equal(statement.seeking, false)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'if',
      jsArg: 'username',
      raw: 'if(username)'
    })
  })

  test('tokenize chars when it has multiple parens', (assert) => {
    const statement = new TagStatement(1)
    statement.feed('if((2 + 2))')

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'if',
      jsArg: '(2 + 2)',
      raw: 'if((2 + 2))'
    })
  })

  test('throw error when trying to feed after statement has been ended', (assert) => {
    const statement = new TagStatement(1)
    const fn = () => statement.feed('if((2 + 2)) then run')
    assert.throw(fn, 'Unexpected token { then run}. Write in a new line')
  })

  test('throw error when calling feed multiple times and statement is ended', (assert) => {
    const statement = new TagStatement(1)
    statement.feed('if((2 + 2))')
    const fn = () => statement.feed('then run')
    assert.throw(fn, 'Unexpected token {then run}. Write in a new line')
  })

  test('parse statement into tokens when feeded in multiple lines', (assert) => {
    const statement = new TagStatement(1)
    const template = dedent`if (
      2 + 2 === 4
    )`

    template
      .split('\n')
      .forEach((line) => {
        statement.feed(line)
      })

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'if',
      jsArg: '\n  2 + 2 === 4\n',
      raw: template
    })
  })

  test('keep ended as false when there are no parens', (assert) => {
    const statement = new TagStatement(1)
    statement.feed('if')

    assert.equal(statement.ended, false)
    assert.equal(statement.started, false)
    assert.equal(statement.seeking, true)

    assert.deepEqual(statement.props, {
      name: '',
      jsArg: '',
      raw: 'if'
    })
  })

  test('keep ended as false when there are no closing parens', (assert) => {
    const statement = new TagStatement(1)
    statement.feed('if(')

    assert.equal(statement.ended, false)
    assert.equal(statement.seeking, true)
    assert.equal(statement.started, true)
    assert.isNotNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'if',
      jsArg: '',
      raw: 'if('
    })
  })

  test('throw error when there is a closing paren without opening paren', (assert) => {
    const statement = new TagStatement(1)
    const fn = () => statement.feed('if)')
    assert.throw(fn, 'Unexpected token ). Wrap statement inside ()')
  })

  test('do not seek statements which are not seekable', (assert) => {
    const statement = new TagStatement(1, false)
    statement.feed('else')

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'else',
      jsArg: '',
      raw: 'else'
    })
  })

  test('trim whitespaces from statements which are not seekable', (assert) => {
    const statement = new TagStatement(1, false)
    statement.feed('  else  ')

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'else',
      jsArg: '',
      raw: '  else  '
    })
  })

  test('record whitespaces for multi line statements', (assert) => {
    const statement = new TagStatement(1)
    const template = dedent`if(
      users.find((user) => {
        return user.username === 'virk'
      })
    )`

    template
      .split('\n')
      .forEach((line) => statement.feed(line))

    assert.equal(statement.ended, true)
    assert.equal(statement.started, true)
    assert.isNull(statement['internalProps'])

    assert.deepEqual(statement.props, {
      name: 'if',
      jsArg: `\n  users.find((user) => {\n    return user.username === 'virk'\n  })\n`,
      raw: template
    })
  })
})
