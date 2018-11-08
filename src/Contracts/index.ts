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
export type ITagProp = {
  name: string
  jsArg: string,
  selfclosed: boolean,
}

/**
 * Mustache properties node
 */
export type IMustacheProp = {
  jsArg: string,
}

/**
 * Location node for tags and mustaches
 */
export type ILoc = {
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
export type ITagDefination = {
  block: boolean,
  seekable: boolean,
}

/**
 * Raw line token
 */
export type IRawToken = {
  type: 'raw',
  value: string,
  line: number,
}

/**
 * New line token
 */
export type INewLineToken = {
  type: 'newline',
  line: number,
}

/**
 * Mustache token
 */
export type IMustacheToken = {
  type: MustacheTypes,
  properties: IMustacheProp,
  loc: ILoc,
}

/**
 * Tag token
 */
export type ITagToken = {
  type: TagTypes,
  properties: ITagProp,
  loc: ILoc,
  children: Array<IRawToken | INewLineToken | ITagToken | IMustacheToken>,
}

/**
 * The runtime tag node to know the shape of a tag
 */
export type IRuntimeTag = {
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
export type IRuntimeMustache = {
  escaped: boolean,
  safe: boolean,
  line: number,
  col: number,
  realCol: number,
}

export type ITags = {
  [name: string]: ITagDefination,
}
