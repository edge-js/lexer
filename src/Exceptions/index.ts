/**
 * @module Lexer
 */

/*
* edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { EdgeError } from 'edge-error'

export function cannotSeekStatement (chars: string, pos: { line: number, col: number }, filename: string): EdgeError {
  return new EdgeError(`Unexpected token "${chars}"`, 'E_CANNOT_SEEK_STATEMENT', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

export function unclosedParen (pos: { line: number, col: number }, filename: string): EdgeError {
  return new EdgeError(`Missing token ")"`, 'E_UNCLOSED_PAREN', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

export function unclosedCurlyBrace (pos: { line: number, col: number }, filename: string): EdgeError {
  return new EdgeError(`Missing token "}"`, 'E_UNCLOSED_CURLY_BRACE', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}

export function unclosedTag (tag: string, pos: { line: number, col: number }, filename: string): EdgeError {
  return new EdgeError(`Unclosed tag ${tag}`, 'E_UNCLOSED_TAG', {
    line: pos.line,
    col: pos.col,
    filename: filename,
  })
}
