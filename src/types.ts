/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { MustacheTypes, TagTypes } from './enums.js'

/**
 * Properties node for a tag
 */
export type TagProps = {
  name: string
  jsArg: string
  selfclosed: boolean
}

/**
 * Properties for a mustache block
 */
export type MustacheProps = {
  jsArg: string
}

/**
 * Location node for tags and mustache braces
 */
export type LexerLoc = {
  start: {
    line: number
    col: number
  }
  end: {
    line: number
    col: number
  }
}

/**
 * The properties required by the lexer on a tag
 * definition
 */
export interface LexerTagDefinitionContract {
  block: boolean
  seekable: boolean
  noNewLine?: boolean
}

/**
 * Raw line token
 */
export type RawToken = {
  type: 'raw'
  value: string
  line: number
  filename: string
}

/**
 * New line token
 */
export type NewLineToken = {
  type: 'newline'
  line: number
  filename: string
}

/**
 * Comment token
 */
export type CommentToken = {
  type: 'comment'
  value: string
  loc: LexerLoc
  filename: string
}

/**
 * Mustache token
 */
export type MustacheToken = {
  type: MustacheTypes
  properties: MustacheProps
  loc: LexerLoc
  filename: string
}

/**
 * Tag token
 */
export type TagToken = {
  type: TagTypes
  properties: TagProps
  loc: LexerLoc
  children: Token[]
  filename: string
}

export type Token = RawToken | NewLineToken | TagToken | MustacheToken | CommentToken

/**
 * The runtime tag node to know the shape of a tag
 */
export type RuntimeTag = LexerTagDefinitionContract & {
  name: string
  filename: string
  selfclosed: boolean
  col: number
  line: number
  escaped: boolean
  hasBrace: boolean
}

/**
 * Runtime mustache node to know the shape of the mustache
 */
export type RuntimeMustache = {
  isComment: false
  escaped: boolean
  filename: string
  safe: boolean
  line: number
  col: number
  realCol: number
}

/**
 * Runtime comment node to know the shape of the comment
 */
export type RuntimeComment = {
  isComment: true
  filename: string
  line: number
  col: number
  realCol: number
}

/**
 * Tags accepted by the tokenie=zer
 */
export interface Tags {
  [name: string]: LexerTagDefinitionContract
}

/**
 * Options accepted by the tokenizer
 */
export type TokenizerOptions = {
  filename: string
  onLine?: (line: string) => string
  claimTag?: (name: string) => LexerTagDefinitionContract | null
}
