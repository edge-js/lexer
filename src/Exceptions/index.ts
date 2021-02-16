/**
 * edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'

/**
 * Raised when there is inline content next to a tag opening
 * block. For example:
 *
 * Incorrect
 * ```
 * @if(username) Hello {{ username }} @endif
 * ```
 *
 * Correct
 * ```
 * @if(username)
 *   Hello {{ username }}
 * @endif
 * ```
 */
export function cannotSeekStatement(
  chars: string,
  pos: { line: number; col: number },
  filename: string
): EdgeError {
  return new EdgeError(`Unexpected token "${chars}"`, 'E_CANNOT_SEEK_STATEMENT', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

/**
 * Raised when a tag opening body doesn't have a closing brace. For example:
 *
 * Incorrect
 * ```
 * @if(username
 * ```
 *
 * Correct
 * ```
 * @if(username)
 * ```
 */
export function unclosedParen(pos: { line: number; col: number }, filename: string): EdgeError {
  return new EdgeError('Missing token ")"', 'E_UNCLOSED_PAREN', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

/**
 * Raised when a tag is used without an opening brace. For example:
 *
 * Incorrect
 * ```
 * @if username
 * ```
 *
 * Correct
 * ```
 * @if(username)
 * ```
 */
export function unopenedParen(pos: { line: number; col: number }, filename: string): EdgeError {
  return new EdgeError('Missing token "("', 'E_UNOPENED_PAREN', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

/**
 * Raised when the curly closing brace is missing from the mustache
 * statement. For example:
 *
 * Incorrect
 * ```
 * {{ username }
 * ```
 *
 * Correct
 *
 * ```
 * {{ username }}
 * ```
 */
export function unclosedCurlyBrace(
  pos: { line: number; col: number },
  filename: string
): EdgeError {
  return new EdgeError('Missing token "}"', 'E_UNCLOSED_CURLY_BRACE', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

/**
 * Raised when a block level tag is opened but never closed. For example:
 *
 * Incorrect
 * ```
 * @if(username)
 * ```
 *
 * Correct
 * ```
 * @if(username)
 * @endif
 * ```
 */
export function unclosedTag(
  tag: string,
  pos: { line: number; col: number },
  filename: string
): EdgeError {
  return new EdgeError(`Unclosed tag ${tag}`, 'E_UNCLOSED_TAG', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}
