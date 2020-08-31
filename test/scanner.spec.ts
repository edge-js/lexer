/**
 * edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dedent from 'dedent'
import test from 'japa'
import { Scanner } from '../src/Scanner'

test.group('Scanner', () => {
	test('scan characters till end of a pattern', (assert) => {
		const scanner = new Scanner(')', ['(', ')'], 1, 0)
		scanner.scan('username)')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, 'username')
		assert.equal(scanner.leftOver, '')
	})

	test('scan characters till end of a pattern with tolerations', (assert) => {
		const scanner = new Scanner(')', ['(', ')'], 1, 0)
		scanner.scan('(2 + 2) * 3)')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, '(2 + 2) * 3')
		assert.equal(scanner.leftOver, '')
	})

	test('scan characters and return left over after the match', (assert) => {
		const scanner = new Scanner(')', ['(', ')'], 1, 0)
		scanner.scan('(2 + 2) * 3) is 12')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, '(2 + 2) * 3')
		assert.equal(scanner.leftOver, ' is 12')
	})

	test('return null when unable to find closing pattern', (assert) => {
		const scanner = new Scanner(')', ['(', ')'], 1, 0)
		scanner.scan('(2 + 2) * 3')
		assert.isFalse(scanner.closed)
	})

	test('scan multiple times unless closing pattern matches', (assert) => {
		const scanner = new Scanner(')', ['(', ')'], 1, 0)
		scanner.scan('(2 + 2)')
		scanner.scan(' * 3')

		scanner.scan(') is 12')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, '(2 + 2) * 3')
		assert.equal(scanner.leftOver, ' is 12')
	})

	test('scan for pair of ending patterns', (assert) => {
		const scanner = new Scanner('}}', ['{', '}'], 1, 0)
		scanner.scan(' username }}')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, ' username ')
		assert.equal(scanner.leftOver, '')
	})

	test('tolerate when scaning for ending pairs', (assert) => {
		const scanner = new Scanner('}}', ['{', '}'], 1, 0)
		scanner.scan(' {username} }}')

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, ' {username} ')
		assert.equal(scanner.leftOver, '')
	})

	test('return null when ending pairs are not matched', (assert) => {
		const scanner = new Scanner('}}}', ['{', '}'], 1, 0)
		scanner.scan(' {username} }}')

		assert.isFalse(scanner.closed)
	})

	test('work fine when ending patterns are mixed in multiple lines', (assert) => {
		const template = dedent`
    {{
      {username
    }}}`

		const scanner = new Scanner('}}', ['{', '}'], 1, 0)
		const lines = template.split('\n')

		scanner.scan(lines[1])
		scanner.scan(lines[2])

		assert.isTrue(scanner.closed)
		assert.equal(scanner.match, '  {username}')
		assert.equal(scanner.leftOver, '')
	})
})
