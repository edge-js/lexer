/*
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Token, TagTypes, TagToken, MustacheToken, MustacheTypes } from './types.js'

/**
 * Returns true when token is a tag with a given name
 */
export function isTag(token: Token, name?: string): token is TagToken {
  if (token.type === TagTypes.TAG || token.type === TagTypes.ETAG) {
    return name ? token.properties.name === name : true
  }
  return false
}

/**
 * Returns true when token is an escape tag with a given name
 */
export function isEscapedTag(token: Token, name?: string): token is TagToken {
  if (token.type === TagTypes.ETAG) {
    return name ? token.properties.name === name : true
  }
  return false
}

/**
 * Returns true when token.type is a mustache type
 */
export function isMustache(token: Token): token is MustacheToken {
  return (
    token.type === MustacheTypes.EMUSTACHE ||
    token.type === MustacheTypes.ESMUSTACHE ||
    token.type === MustacheTypes.MUSTACHE ||
    token.type === MustacheTypes.SMUSTACHE
  )
}

/**
 * Returns true when token.type is a safe mustache type
 */
export function isSafeMustache(token: Token): token is MustacheToken {
  return token.type === MustacheTypes.ESMUSTACHE || token.type === MustacheTypes.SMUSTACHE
}

/**
 * Returns true when toke.type is an escaped mustache type
 */
export function isEscapedMustache(token: Token): token is MustacheToken {
  return token.type === MustacheTypes.EMUSTACHE || token.type === MustacheTypes.ESMUSTACHE
}

/**
 * Returns line and column number for a given lexer token
 */
export function getLineAndColumn(token: Token): [number, number] {
  if (token.type === 'newline' || token.type === 'raw') {
    return [token.line, 0]
  }
  return [token.loc.start.line, token.loc.start.col]
}
