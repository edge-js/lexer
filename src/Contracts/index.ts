/**
 * edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Types for mustache statements
 */
export enum MustacheTypes {
  SMUSTACHE = 's__mustache',
  ESMUSTACHE = 'es__mustache',
  MUSTACHE = 'mustache',
  EMUSTACHE = 'e__mustache',
}

/**
 * The type of node types. Each token
 * will have one of these types
 */
export enum TagTypes {
  TAG = 'tag',
  ETAG = 'e__tag',
}

/**
 * Properties node for a tag
 */
export type TagProps = {
  name: string,
  jsArg: string,
  selfclosed: boolean,
}

/**
 * Properties for a mustache block
 */
export type MustacheProps = {
  jsArg: string,
}

/**
 * Location node for tags and mustache braces
 */
export type LexerLoc = {
  start: {
    line: number,
    col: number,
  },
  end: {
    line: number,
    col: number,
  },
}

/**
 * The properties required by the lexer on a tag
 * definition
 */
export interface LexerTagDefinitionContract {
  block: boolean,
  seekable: boolean,
}

/**
 * Raw line token
 */
export type RawToken = {
  type: 'raw',
  value: string,
  line: number,
}

/**
 * New line token
 */
export type NewLineToken = {
  type: 'newline',
  line: number,
}

/**
 * Mustache token
 */
export type MustacheToken = {
  type: MustacheTypes,
  properties: MustacheProps,
  loc: LexerLoc,
}

/**
 * Tag token
 */
export type TagToken = {
  type: TagTypes,
  properties: TagProps,
  loc: LexerLoc,
  children: Token[],
}

export type Token = RawToken | NewLineToken | TagToken | MustacheToken

/**
 * The runtime tag node to know the shape of a tag
 */
export type RuntimeTag = {
  name: string,
  selfclosed: boolean,
  col: number,
  line: number,
  block: boolean,
  seekable: boolean,
  escaped: boolean,
  hasBrace: boolean,
}

/**
 * Runtime mustache node to know the shape of the mustache
 */
export type RuntimeMustache = {
  escaped: boolean,
  safe: boolean,
  line: number,
  col: number,
  realCol: number,
}

export interface Tags {
  [name: string]: LexerTagDefinitionContract,
}
