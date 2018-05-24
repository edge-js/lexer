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

import * as whitespace from 'is-whitespace-character'
import { WhiteSpaceModes } from '../Contracts'

/**
 * Char bucket is used to control the white space inside
 * a string. You feed one character at a time to this
 * class and it will make sure the whitespace is
 * controlled as instructed.
 *
 * There are 3 modes in total
 *
 * 1. CONTROLLED - Only one whitspace at a time
 * 2. NONE - Zero whitespaces
 * 3. ALL - All whitespaces
 *
 * ```
 * const charBucket = new CharBucket(WhiteSpaceModes.NONE)
 *
 * charBucket.feed('h')
 * charBucket.feed('i')
 * charBucket.feed(' ')
 * charBucket.feed(' ')
 * charBucket.feed(' ')
 * charBucket.feed('!')
 *
 * // Output
 * charBucket.get() // hi!
 * ```
 */
export default class CharBucket {
  public lastChar: string = ''
  private chars: string = ''

  constructor (private whitespace: WhiteSpaceModes) {
  }

  /**
   * Returns all chars recorded so far
   *
   * @returns string
   */
  public get (): string {
    return this.chars
  }

  /**
   * Feed a char to the bucket
   */
  public feed (char: string): void {
    this.lastChar = char

    if (this.whitespace === WhiteSpaceModes.NONE) {
      if (whitespace(char)) {
        return
      }
      this.chars += char
      return
    }

    this.chars += char
  }

  /**
   * Remove last character from the string
   */
  public pop (): void {
    this.chars = this.chars.slice(0, -1)
  }
}
