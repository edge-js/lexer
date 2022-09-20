/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  Tags,
  RuntimeTag,
  RuntimeComment,
  RuntimeMustache,
  LexerTagDefinitionContract,
} from './types'

/**
 * The only regex we need in the entire lexer. Also tested
 * with https://github.com/substack/safe-regex
 */
const TAG_REGEX = /^(\s*)(@{1,2})(!)?([a-zA-Z._]+)(\s{0,2})/

/**
 * Returns runtime tag node if tag is detected and is a registered tag
 */
export function getTag(
  content: string,
  filename: string,
  line: number,
  col: number,
  tags: Tags,
  claimTag?: (name: string) => LexerTagDefinitionContract | null
): RuntimeTag | null {
  const match = TAG_REGEX.exec(content)

  /**
   * Return when their is no match
   */
  if (!match) {
    return null
  }

  const name = match[4]
  let tag: null | LexerTagDefinitionContract = tags[name]

  /**
   * See if the tag can be claimed
   */
  if (!tag && claimTag) {
    tag = claimTag(name)
  }

  /**
   * Return when not a registered tag
   */
  if (!tag) {
    return null
  }

  const escaped = match[2] === '@@'
  const selfclosed = !!match[3]
  const whitespaceLeft = match[1].length
  const whitespaceRight = match[5].length
  const seekable = tag.seekable
  const block = tag.block
  const noNewLine = !!tag.noNewLine

  /**
   * Advanced the col position
   */
  col += whitespaceLeft + match[2].length + name.length + whitespaceRight
  if (selfclosed) {
    col++
  }

  /**
   * Seekable tags without the brace in same line are invalid
   */
  const hasBrace = seekable && content[col] === '('

  return {
    name,
    filename,
    seekable,
    selfclosed,
    block,
    line,
    col,
    escaped,
    hasBrace,
    noNewLine,
  }
}

/**
 * Returns the runtime mustache node if mustache is detected. It will look for 3 types of
 * mustache statements.
 *
 * - Comments `{{-- --}}`
 * - Safe Mustache `{{{ }}}`
 * - Escaped Mustache `@{{}}`
 */
export function getMustache(
  content: string,
  filename: string,
  line: number,
  col: number
): RuntimeMustache | RuntimeComment | null {
  const mustacheIndex = content.indexOf('{{')

  if (mustacheIndex === -1) {
    return null
  }

  const realCol = mustacheIndex

  /**
   * Mustache is a comment
   */
  const isComment = content[mustacheIndex + 2] === '-' && content[mustacheIndex + 3] === '-'
  if (isComment) {
    return {
      isComment,
      filename,
      line,
      col: col + realCol,
      realCol,
    }
  }

  /**
   * Mustache is for interpolation
   */
  const safe = content[mustacheIndex + 2] === '{'
  const escaped = content[mustacheIndex - 1] === '@'

  return {
    isComment,
    safe,
    filename,
    escaped,
    line,
    col: col + realCol,
    realCol,
  }
}
