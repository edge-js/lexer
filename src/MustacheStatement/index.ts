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

import { IMustacheProp, WhiteSpaceModes, MustacheType, ILoc } from '../Contracts'
import { CharBucket } from '../CharBucket'

/** @hidden */
const OPENING_BRACE = 123

/** @hidden */
const CLOSING_BRACE = 125

/**
 * The mustache statement parses the content inside the curly
 * braces. Since the statement can be in multiple lines, this
 * class seeks for more content unless closing braces are
 * detected.
 *
 * ```
 * const statement = new MustacheStatement(1)
 * statement.feed('Hello {{ username }}!')
 *
 * console.log(statement.props)
 * {
 *   name: 'mustache',
 *   jsArg: ' username ',
 *   raw: 'Hello {{ username }}!',
 *   textLeft: 'Hello ',
 *   textRight: '!'
 * }
 * ```
 */
export class MustacheStatement {
  /**
   * Whether or not the statement has been started. Statement
   * is considered as started, when opening curly braces
   * are detected.
   */
  public started: boolean = false

  /**
   * Whether or not the statement has been ended. Once ended, you
   * cannot feed more content.
   */
  public ended: boolean = false

  /**
   * Statement meta data
   *
   * @type {IMustacheProp}
   */
  public props: IMustacheProp = {
    name: MustacheType.MUSTACHE,
    jsArg: '',
    raw: '',
    textLeft: '',
    textRight: '',
  }

  /**
   * Location details of the statement
   */
  public loc: ILoc = {
    start: {
      line: this._line,
      col: this._col,
    },
    end: {
      line: this._line,
      col: this._col,
    },
  }

  /**
   * Tracking the first call to the feed method. This is done to
   * add new lines to the raw output
   */
  private firstCall: boolean = true

  /**
   * The current prop from where to start seeding
   */
  private currentProp: string = 'textLeft'

  /**
   * Tracking mustache braces within the mustache tag. This is done
   * to find if mustache is closed properly or not
   */
  private internalBraces: number = 0

  /**
   * Seeding characters to the internal props, unless they are complete and
   * then moved to props.
   */
  private internalProps: null | { jsArg: CharBucket, textLeft: CharBucket, textRight: CharBucket } = {
    jsArg: new CharBucket(WhiteSpaceModes.ALL),
    textLeft: new CharBucket(WhiteSpaceModes.ALL),
    textRight: new CharBucket(WhiteSpaceModes.ALL),
  }

  constructor (private _line: number, private _col: number) {
  }

  /**
   * Feed a new line to be parsed as mustache. For performance it is recommended
   * to check that line contains alteast one `{{` statement and is not escaped
   * before calling this method.
   */
  public feed (line: string): void {
    /**
     * If feed method is called consecutively, we need to append
     * new lines
     */
    if (!this.firstCall) {
      this.props.raw += `\n${line}`
      this.internalProps![this.currentProp].feed('\n')
      this.loc.end.line++
      this.loc.end.col = 0
    } else {
      this.props.raw += line
      this.firstCall = false
    }

    /**
     * Loop over all the characters and parse line
     */
    const chars = line.split('')
    while (chars.length) {
      const char = chars.shift()!
      this.processChar(chars, char)
    }

    /**
     * If not seeking, then set the last prop
     */
    if (!this.seeking) {
      this.setProp()
      this.internalProps = null
    }
  }

  /**
   * Returns a boolean telling, if value is a safe mustache or
   * escaped safe mustache type.
   */
  private isSafeMustache (value: MustacheType): boolean {
    return [MustacheType.SMUSTACHE, MustacheType.ESMUSTACHE].indexOf(value) !== -1
  }

  /**
   * Returns a boolean telling, if value is a mustache or
   * escaped mustache type.
   */
  private isMustache (value: MustacheType): boolean {
    return [MustacheType.MUSTACHE, MustacheType.EMUSTACHE].indexOf(value) !== -1
  }

  /**
   * Returns the name of the type of the mustache tag. If char and
   * surrounding chars, doesn't form an opening `{{` mustache
   * pattern, then `null` will be returned
   */
  private getName (chars: string[], charCode: number): null | MustacheType {
    if (charCode !== OPENING_BRACE || !chars.length) {
      return null
    }

    let next = chars[0].charCodeAt(0)

    /**
     * Will be considered as mustache, when consecutive chars
     * are {{
     */
    const isMustache = next === OPENING_BRACE
    if (!isMustache) {
      return null
    }

    /**
     * If mustache braces were escaped, then we need to ignore them
     * and set the prop name properly
     */
    const isEscaped = this.internalProps!.textLeft.lastChar === '@'
    if (isEscaped) {
      this.internalProps!.textLeft.pop()
    }

    chars.shift()
    if (!chars.length) {
      return isEscaped ? MustacheType.EMUSTACHE : MustacheType.MUSTACHE
    }

    /**
     * Will be considered as `safe mustache`, when consecutive
     * chars are {{{
     */
    next = chars[0].charCodeAt(0)
    const isEMustache = next === OPENING_BRACE
    if (!isEMustache) {
      return isEscaped ? MustacheType.EMUSTACHE : MustacheType.MUSTACHE
    }

    chars.shift()
    return isEscaped ? MustacheType.ESMUSTACHE : MustacheType.SMUSTACHE
  }

  /**
   * Returns a boolean telling whether the current char and surrounding
   * chars form the closing of mustache.
   */
  private isClosing (chars: string[], charCode: number): boolean {
    if (charCode !== CLOSING_BRACE || this.internalBraces !== 0) {
      return false
    }

    /**
     * If opening statement was detected as `s__mustache`, then expect
     * 2 more consecutive chars as CLOSING_BRACE
     */
    if (this.isSafeMustache(this.props.name!) && chars.length >= 2) {
      const next = chars[0].charCodeAt(0)
      const nextToNext = chars[1].charCodeAt(0)

      if (next === CLOSING_BRACE && nextToNext === CLOSING_BRACE) {
        chars.shift()
        chars.shift()
        return true
      }

      return false
    }

    /**
     * If opening statement was detected as `mustache`, then expect
     * 1 more consecutive char as CLOSING_BRACE
     */
    if (this.isMustache(this.props.name!) && chars.length >= 1) {
      const next = chars[0].charCodeAt(0)

      if (next === CLOSING_BRACE) {
        chars.shift()
        return true
      }

      return false
    }

    return false
  }

  /**
   * Returns `true` when seeking for more content.
   */
  get seeking (): boolean {
    return this.started && !this.ended
  }

  /**
   * Updates the columns as we proceed with each character
   */
  private trackCol () {
    if (this.currentProp === 'textLeft') {
      this.loc.start.col++
    }

    if (this.currentProp !== 'textRight') {
      this.loc.end.col++
    }
  }

  /**
   * Process one char at a time
   */
  private processChar (chars: string[], char: string): void {
    let name: null | MustacheType = null
    const charCode = char.charCodeAt(0)

    this.trackCol()

    /**
     * Only process name, when are not in inside mustache
     * statement.
     */
    if (!this.started) {
      name = this.getName(chars, charCode)
    }

    /**
     * When a name is found, we consider it as a start
     * of `mustache` statement
     */
    if (name) {
      this.props.name = name
      this.started = true
      this.setProp()
      this.loc.start.col = this.props.name === MustacheType.SMUSTACHE ? this.loc.start.col + 2 : this.loc.start.col + 1
      this.loc.end.col = this.props.name === MustacheType.SMUSTACHE ? this.loc.end.col + 2 : this.loc.end.col + 1
      this.currentProp = 'jsArg'
      return
    }

    /**
     * If statement was started and not ended and is a closing
     * tag, then close mustache
     */
    if (this.started && !this.ended && this.isClosing(chars, charCode)) {
      this.setProp()
      this.loc.end.col = this.props.name === MustacheType.SMUSTACHE ? this.loc.end.col + 2 : this.loc.end.col + 1
      this.currentProp = 'textRight'
      this.ended = true
      return
    }

    if (charCode === OPENING_BRACE) {
      this.internalBraces++
    }

    if (charCode === CLOSING_BRACE) {
      this.internalBraces--
    }

    this.internalProps![this.currentProp].feed(char)
  }

  /**
   * Sets the value from internal prop to the public prop
   * as a string.
   */
  private setProp (): void {
    this.props[this.currentProp] = this.internalProps![this.currentProp].get()
  }
}
