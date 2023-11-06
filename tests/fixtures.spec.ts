/*
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { fixtures } from '../fixtures/index.js'
import { Tokenizer } from '../src/tokenizer.js'

const tags = {
  if: {
    seekable: true,
    block: true,
  },
  include: {
    seekable: true,
    block: false,
  },
}

test.group('fixtures', () => {
  fixtures.forEach((fixture) => {
    test(fixture.name, ({ assert }) => {
      const tokenizer = new Tokenizer(fixture.in, tags, { filename: 'eval.edge' })
      tokenizer.parse()
      assert.deepEqual(tokenizer.tokens, fixture.out)
    })
  })
})
