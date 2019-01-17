/**
 * @module Lexer
 */

/**
 * Just mustache types to avoid writing them over
 * and over again
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
 * The properties node for a node node
 */
export type TagProp = {
  name: string
  jsArg: string,
  selfclosed: boolean,
}

/**
 * Mustache properties node
 */
export type MustacheProp = {
  jsArg: string,
}

/**
 * Location node for tags and mustaches
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
 * Tag defination for multiple tags
 */
export type TagDefination = {
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
  properties: MustacheProp,
  loc: LexerLoc,
}

/**
 * Tag token
 */
export type TagToken = {
  type: TagTypes,
  properties: TagProp,
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

/**
 * Tags registered with the lexer to be scanned
 */
export type Tags = {
  [name: string]: TagDefination,
}
