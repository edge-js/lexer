/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { getTag, getMustache } from '../src/detector'

test.group('Detector (tag)', () => {
  test("return null when statement isn't starting with @", ({ assert }) => {
    assert.isNull(getTag('hello world', 'eval.edge', 1, 0, {}))
  })

  test('return null when statement has @ but in between the text', ({ assert }) => {
    assert.isNull(getTag('hello @world', 'eval.edge', 1, 0, {}))
  })

  test('return tag node when does starts with @', ({ assert }) => {
    const tags = { hello: { seekable: true, block: false } }

    assert.deepEqual(getTag('@hello()', 'eval.edge', 1, 0, tags), {
      name: 'hello',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 6,
      hasBrace: true,
      seekable: true,
      block: false,
      noNewLine: false,
    })
  })

  test('computed col for non seekable tags', ({ assert }) => {
    const tags = { hello: { seekable: false, block: false } }

    assert.deepEqual(getTag('@hello', 'eval.edge', 1, 0, tags), {
      name: 'hello',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 6,
      hasBrace: false,
      seekable: false,
      block: false,
      noNewLine: false,
    })
  })

  test('ignore whitespace for non-seekable tags', ({ assert }) => {
    const tags = { hello: { seekable: false, block: false } }

    assert.deepEqual(getTag('@hello   ', 'eval.edge', 1, 0, tags), {
      name: 'hello',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 8,
      hasBrace: false,
      seekable: false,
      block: false,
      noNewLine: false,
    })
  })

  test('detect escaped tags', ({ assert }) => {
    const tags = { hello: { seekable: false, block: false } }

    assert.deepEqual(getTag('@@hello   ', 'eval.edge', 1, 0, tags), {
      name: 'hello',
      filename: 'eval.edge',
      escaped: true,
      selfclosed: false,
      line: 1,
      col: 9,
      hasBrace: false,
      seekable: false,
      block: false,
      noNewLine: false,
    })
  })

  test('detect selfclosed non seekable tags', ({ assert }) => {
    const tags = { hello: { seekable: false, block: false } }

    assert.deepEqual(getTag('@!hello', 'eval.edge', 1, 0, tags), {
      name: 'hello',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: true,
      line: 1,
      col: 7,
      hasBrace: false,
      seekable: false,
      block: false,
      noNewLine: false,
    })
  })

  test('do not include special chars in non seekable tag names', ({ assert }) => {
    const tags = { hel: { seekable: false, block: false } }

    assert.deepEqual(getTag('@hel-lo', 'eval.edge', 1, 0, tags), {
      name: 'hel',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 4,
      hasBrace: false,
      seekable: false,
      block: false,
      noNewLine: false,
    })
  })

  test('detect name for seekable tags', ({ assert }) => {
    const tags = { if: { seekable: true, block: true } }

    assert.deepEqual(getTag('@if(username)', 'eval.edge', 1, 0, tags), {
      name: 'if',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 3,
      hasBrace: true,
      seekable: true,
      block: true,
      noNewLine: false,
    })
  })

  test('set hasBrace to false when seekable tag is missing the brace', ({ assert }) => {
    const tags = { if: { seekable: true, block: true } }

    assert.deepEqual(getTag('@if', 'eval.edge', 1, 0, tags), {
      name: 'if',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 3,
      hasBrace: false,
      seekable: true,
      block: true,
      noNewLine: false,
    })
  })

  test('collect whitespace in front of the tag', ({ assert }) => {
    const tags = { if: { seekable: true, block: true } }

    assert.deepEqual(getTag('  @if(username)', 'eval.edge', 1, 0, tags), {
      name: 'if',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 5,
      hasBrace: true,
      seekable: true,
      block: true,
      noNewLine: false,
    })
  })

  test('collect max of 2 whitspaces before the opening brace', ({ assert }) => {
    const tags = { if: { seekable: true, block: true } }

    assert.deepEqual(getTag('  @if  (username)', 'eval.edge', 1, 0, tags), {
      name: 'if',
      filename: 'eval.edge',
      escaped: false,
      selfclosed: false,
      line: 1,
      col: 7,
      hasBrace: true,
      seekable: true,
      block: true,
      noNewLine: false,
    })
  })
})

test.group('Detector (mustache)', () => {
  test("return null when statement doesn't have mustache blocks", ({ assert }) => {
    assert.isNull(getMustache('hello world', 'eval.edge', 1, 0))
  })

  test('return mustache details when has mustache braces', ({ assert }) => {
    assert.deepEqual(getMustache('Hello {{ username }}', 'eval.edge', 1, 0), {
      filename: 'eval.edge',
      col: 6,
      line: 1,
      realCol: 6,
      escaped: false,
      safe: false,
      isComment: false,
    })
  })

  test('return mustache details when mustache has 3 braces', ({ assert }) => {
    assert.deepEqual(getMustache('Hello {{{ username }}}', 'eval.edge', 1, 0), {
      filename: 'eval.edge',
      col: 6,
      line: 1,
      realCol: 6,
      escaped: false,
      safe: true,
      isComment: false,
    })
  })

  test('return mustache details when mustache is escaped', ({ assert }) => {
    assert.deepEqual(getMustache('Hello @{{{ username }}}', 'eval.edge', 1, 0), {
      filename: 'eval.edge',
      col: 7,
      line: 1,
      realCol: 7,
      escaped: true,
      safe: true,
      isComment: false,
    })
  })

  test('return correct col when mustache is in between the content', ({ assert }) => {
    assert.deepEqual(getMustache('Hello @{{{ username }}}', 'eval.edge', 1, 8), {
      filename: 'eval.edge',
      col: 15,
      line: 1,
      realCol: 7,
      escaped: true,
      safe: true,
      isComment: false,
    })
  })
})
