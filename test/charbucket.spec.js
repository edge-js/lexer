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
const CharBucket = require('../build/CharBucket').default
const { WhiteSpaceModes } = require('../build/Contracts')

test.group('CharBucket', () => {
  test('record all whitespaces when whitespace mode is all', (assert) => {
    const charbucket = new CharBucket(WhiteSpaceModes.ALL)
    charbucket.feed('2')
    charbucket.feed(' ')
    charbucket.feed('+')
    charbucket.feed(' ')
    charbucket.feed(' ')
    charbucket.feed('2')
    assert.equal(charbucket.get(), '2 +  2')
  })

  test('consider zero whitespaces when mode is none', (assert) => {
    const charbucket = new CharBucket(WhiteSpaceModes.NONE)
    charbucket.feed('2')
    charbucket.feed(' ')
    charbucket.feed('+')
    charbucket.feed(' ')
    charbucket.feed(' ')
    charbucket.feed('2')
    assert.equal(charbucket.get(), '2+2')
  })
})
