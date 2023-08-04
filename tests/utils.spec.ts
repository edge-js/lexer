/*
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import * as utils from '../src/utils.js'
import { TagTypes, MustacheTypes } from '../src/enums.js'

test.group('Utils | isTag', () => {
  test('return true when token type is a tag with a given name', ({ assert }) => {
    assert.isTrue(
      utils.isTag(
        {
          type: TagTypes.TAG,
          properties: {
            name: 'include',
            jsArg: '',
            selfclosed: true,
          },
          filename: 'eval.edge',
          loc: {
            start: { line: 1, col: 0 },
            end: { line: 1, col: 20 },
          },
          children: [],
        },
        'include'
      )
    )
  })

  test('return false when token type is a tag with different name', ({ assert }) => {
    assert.isFalse(
      utils.isTag(
        {
          type: TagTypes.TAG,
          properties: {
            name: 'include',
            jsArg: '',
            selfclosed: true,
          },
          filename: 'eval.edge',
          loc: {
            start: { line: 1, col: 0 },
            end: { line: 1, col: 20 },
          },
          children: [],
        },
        'layout'
      )
    )
  })

  test('return false when token type is not a tag', ({ assert }) => {
    assert.isFalse(
      utils.isTag(
        {
          type: 'raw',
          value: '',
          filename: 'eval.edge',
          line: 1,
        },
        'layout'
      )
    )
  })

  test('return true when token type is an escaped tag', ({ assert }) => {
    assert.isTrue(
      utils.isEscapedTag({
        type: TagTypes.ETAG,
        properties: {
          name: 'include',
          jsArg: '',
          selfclosed: true,
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
        children: [],
      })
    )
  })

  test('return true when token type is not an escaped tag', ({ assert }) => {
    assert.isFalse(
      utils.isEscapedTag({
        type: TagTypes.TAG,
        properties: {
          name: 'include',
          jsArg: '',
          selfclosed: true,
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
        children: [],
      })
    )
  })
})

test.group('Utils | isMustache', () => {
  test('return true when token type is a mustache tag', ({ assert }) => {
    assert.isTrue(
      utils.isMustache({
        type: MustacheTypes.EMUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
      })
    )
  })

  test('return false when token type is not a mustache tag', ({ assert }) => {
    assert.isFalse(
      utils.isMustache({
        type: 'raw',
        value: '',
        filename: 'eval.edge',
        line: 1,
      })
    )
  })

  test('return true when token type is a safe mustache tag', ({ assert }) => {
    assert.isTrue(
      utils.isSafeMustache({
        type: MustacheTypes.SMUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
      })
    )
  })

  test('return false when token type is not a safe mustache tag', ({ assert }) => {
    assert.isFalse(
      utils.isSafeMustache({
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
      })
    )
  })

  test('return true when token type is an escaped mustache tag', ({ assert }) => {
    assert.isTrue(
      utils.isEscapedMustache({
        type: MustacheTypes.EMUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
      })
    )
  })

  test('return false when token type is not an escaped mustache tag', ({ assert }) => {
    assert.isFalse(
      utils.isEscapedMustache({
        type: MustacheTypes.MUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
      })
    )
  })
})

test.group('Utils | getLineAndColumn', () => {
  test('return line and column for a tag token', ({ assert }) => {
    assert.deepEqual(
      utils.getLineAndColumn({
        type: TagTypes.TAG,
        properties: {
          name: 'include',
          jsArg: '',
          selfclosed: true,
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 0 },
          end: { line: 1, col: 20 },
        },
        children: [],
      }),
      [1, 0]
    )
  })

  test('return line and column for a mustache token', ({ assert }) => {
    assert.deepEqual(
      utils.getLineAndColumn({
        type: MustacheTypes.EMUSTACHE,
        properties: {
          jsArg: '',
        },
        filename: 'eval.edge',
        loc: {
          start: { line: 1, col: 5 },
          end: { line: 1, col: 20 },
        },
      }),
      [1, 5]
    )
  })

  test('return line and column for a raw token', ({ assert }) => {
    assert.deepEqual(
      utils.getLineAndColumn({
        type: 'raw',
        value: '',
        filename: 'eval.edge',
        line: 1,
      }),
      [1, 0]
    )
  })

  test('return line and column for a newline token', ({ assert }) => {
    assert.deepEqual(
      utils.getLineAndColumn({
        type: 'newline',
        filename: 'eval.edge',
        line: 1,
      }),
      [1, 0]
    )
  })
})
