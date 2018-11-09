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

import { getTag, getMustache } from '../Detector'
import { Scanner } from '../Scanner'

import { unclosedParen, unclosedTag, unclosedCurlyBrace, cannotSeekStatement, unopenedParen } from '../Exceptions'

import {
  ITagToken,
  IMustacheToken,
  ITags,
  IRawToken,
  INewLineToken,
  IRuntimeTag,
  IRuntimeMustache,
  TagTypes,
  MustacheTypes,
  IToken,
} from '../Contracts'

type tokenizerOptions = {
  filename: string,
}

/**
 * Tokenizer converts a bunch of text into an array of tokens. Later
 * these tokens can be used to build the transformed text.
 *
 * Go through the README file to learn more about the syntax and
 * the tokens output.
 */
export class Tokenizer {
  public tokens: IToken[] = []

  private blockStatement: null | { scanner: Scanner, tag: IRuntimeTag } = null

  private mustacheStatement: null | { scanner: Scanner, mustache: IRuntimeMustache } = null

  private line: number = 0

  private openedTags: ITagToken[] = []

  constructor (private template: string, private tagsDef: ITags, private options: tokenizerOptions) {
  }

  /**
   * Returns the raw token
   */
  private _getRawNode (text): IRawToken {
    return {
      type: 'raw',
      value: text,
      line: this.line,
    }
  }

  /**
   * Returns the new line token
   */
  private _getNewLineNode (): INewLineToken {
    return {
      type: 'newline',
      line: this.line - 1,
    }
  }

  /**
   * Returns the ITag token for a runtime tag. The `jsArg` and ending
   * loc is computed using the scanner and must be passed to this
   * method.
   */
  private _getTagNode (tag: IRuntimeTag, jsArg: string, loc): ITagToken {
    return {
      type: tag.escaped ? TagTypes.ETAG : TagTypes.TAG,
      properties: {
        name: tag.name,
        jsArg: jsArg,
        selfclosed: tag.selfclosed,
      },
      loc: {
        start: {
          line: tag.line,
          col: tag.col,
        },
        end: loc,
      },
      children: [],
    }
  }

  /**
   * Consume the runtime tag node.
   *
   * If tag is `block`, then we push it to the list of
   * opened tags and wait for the closing statement to
   * appear.
   *
   * Otherwise, we move it to the tokens array directly.
   */
  private _consumeTag (tag: IRuntimeTag, jsArg: string, loc) {
    if (tag.block && !tag.selfclosed) {
      this.openedTags.push(this._getTagNode(tag, jsArg, loc))
    } else {
      this._consumeNode(this._getTagNode(tag, jsArg, loc))
    }
  }

  /**
   * Handles the opening of the tag.
   */
  private _handleTagOpening (line: string, tag: IRuntimeTag) {
    if (tag.seekable && !tag.hasBrace) {
      throw unopenedParen({ line: tag.line, col: tag.col }, this.options.filename)
    }

    /**
     * When tag is not seekable, then their is no need to create
     * a scanner instance, just consume it right away.
     */
    if (!tag.seekable) {
      this._consumeTag(tag, '', { line: tag.line, col: tag.col })
      return
    }

    /**
     * Advance the `col`, since we do not want to start from the
     * starting brace `(`.
     */
    tag.col += 1

    /**
     * Create a new block statement with the scanner to find
     * the closing brace ')'
     */
    this.blockStatement = {
      tag: tag,
      scanner: new Scanner(')', ['(', ')'], this.line, tag.col),
    }

    /**
     * Pass all remaining content to the scanner
     */
    this._feedCharsToCurrentTag(line.slice(tag.col))
  }

  /**
   * Scans the string using the scanner and waits for the
   * closing brace ')' to appear
   */
  private _feedCharsToCurrentTag (content: string) {
    const { tag, scanner } = this.blockStatement!

    scanner.scan(content)

    /**
     * If scanner is not closed, then we need to keep on
     * feeding more content
     */
    if (!scanner.closed) {
      return
    }

    /**
     * Consume the tag once we have found the closing brace and set
     * block statement to null
     */
    this._consumeTag(tag, scanner.match, scanner.loc)

    /**
     * Raise error, if there is inline content after the closing brace ')'
     * `@if(username) hello {{ username }}` is invalid
     */
    if (scanner.leftOver.trim()) {
      throw cannotSeekStatement(scanner.leftOver, scanner.loc, this.options.filename)
    }

    this.blockStatement = null
  }

  /**
   * Returns the mustache type by checking for `safe` and `escaped`
   * properties.
   */
  private _getMustacheType (mustache: IRuntimeMustache): MustacheTypes {
    if (mustache.safe) {
      return mustache.escaped ? MustacheTypes.ESMUSTACHE : MustacheTypes.SMUSTACHE
    }

    return mustache.escaped ? MustacheTypes.EMUSTACHE : MustacheTypes.MUSTACHE
  }

  /**
   * Returns the mustache token using the runtime mustache node. The `jsArg` and
   * ending `loc` is fetched using the scanner.
   */
  private _getMustacheNode (mustache: IRuntimeMustache, jsArg: string, loc): IMustacheToken {
    return {
      type: this._getMustacheType(mustache),
      properties: {
        jsArg: jsArg,
      },
      loc: {
        start: {
          line: mustache.line,
          col: mustache.col,
        },
        end: loc,
      },
    }
  }

  /**
   * Handles the line which has mustache opening braces.
   */
  private _handleMustacheOpening (line: string, mustache: IRuntimeMustache) {
    const pattern = mustache.safe ? '}}}' : '}}'
    const textLeftIndex = mustache.escaped ? mustache.realCol - 1 : mustache.realCol

    /**
     * Pull everything that is on the left of the mustache
     * statement and use it as a raw node
     */
    if (textLeftIndex > 0) {
      this._consumeNode(this._getRawNode(line.slice(0, textLeftIndex)))
    }

    /**
     * Skip the curly braces when reading the expression inside
     * it. We are actually skipping opening curly braces
     * `{{`, however, their length will be same as the
     * closing one's/
     */
    mustache.col += pattern.length
    mustache.realCol += pattern.length

    /**
     * Create a new mustache statement with a scanner to scan for
     * closing mustache braces. Note the closing `pattern` is
     * different for safe and normal mustache.
     */
    this.mustacheStatement = {
      mustache,
      scanner: new Scanner(pattern, ['{', '}'], mustache.line, mustache.col),
    }

    /**
     * Feed text to the mustache statement and wait for the closing braces
     */
    this._feedCharsToCurrentMustache(line.slice(mustache.realCol))
  }

  /**
   * Feed chars to the mustache statement, which isn't closed yet.
   */
  private _feedCharsToCurrentMustache (content: string): void {
    const { mustache, scanner } = this.mustacheStatement!
    scanner.scan(content)

    /**
     * If scanner is not closed, then return early, since their
     * not much we can do here.
     */
    if (!scanner.closed) {
      return
    }

    /**
     * Consume the node as soon as we have found the closing brace
     */
    this._consumeNode(this._getMustacheNode(mustache, scanner.match, scanner.loc))

    /**
     * If their is leftOver text after the mustache closing brace, then re-scan
     * it for more mustache statements. Example:
     *
     * I following statement, `, and {{ age }}` is the left over.
     * ```
     * {{ username }}, and {{ age }}
     * ```
     *
     * This block is same the generic new line handler method. However, their is
     * no need to check for tags and comments, so we ditch that method and
     * process it here by duplicating code (which is fine).
     */
    if (scanner.leftOver.trim()) {
      const anotherMustache = getMustache(scanner.leftOver, scanner.loc.line, scanner.loc.col)

      if (anotherMustache) {
        this._handleMustacheOpening(scanner.leftOver, anotherMustache)
        return
      }

      this._consumeNode(this._getRawNode(scanner.leftOver))
    }

    /**
     * Set mustache statement to null
     */
    this.mustacheStatement = null
  }

  /**
   * Returns a boolean telling if the content of the line is the
   * closing tag for the most recently opened tag.
   *
   * The opening and closing has to be in a order, otherwise the
   * compiler will get mad.
   */
  private _isClosingTag (line: string): boolean {
    if (!this.openedTags.length) {
      return false
    }

    const recentTag = this.openedTags[this.openedTags.length - 1]
    return line.trim() === `@end${recentTag.properties.name}`
  }

  /**
   * Consume any type of token by moving it to the correct list. If there are
   * opened tags, then the token becomes part of the tag children. Otherwise
   * moved as top level token.
   */
  private _consumeNode (tag: ITagToken | IRawToken | INewLineToken | IMustacheToken): void {
    if (this.openedTags.length) {
      const latestTag = this.openedTags[this.openedTags.length - 1]

      /**
       * Do not add new line which comes right after the tag statement. Tag
       * lines must not take any space.
       */
      if (tag.type === 'newline' && !latestTag.children.length) {
        return
      }

      this.openedTags[this.openedTags.length - 1].children.push(tag)
      return
    }

    this.tokens.push(tag)
  }

  /**
   * Pushes a new line to the list. This method avoids
   * new lines at position 0.
   */
  private _pushNewLine () {
    if (this.line === 1) {
      return
    }

    this._consumeNode(this._getNewLineNode())
  }

  /**
   * Process the current line based upon what it is. What it is?
   * That's the job of this method to find out.
   */
  private _processText (line: string): void {
    /**
     * There is an open block statement, so feed line to it
     */
    if (this.blockStatement) {
      this._feedCharsToCurrentTag('\n')
      this._feedCharsToCurrentTag(line)
      return
    }

    /**
     * There is an open mustache statement, so feed line to it
     */
    if (this.mustacheStatement) {
      this._feedCharsToCurrentMustache('\n')
      this._feedCharsToCurrentMustache(line)
      return
    }

    /**
     * The line is an closing statement for a previously opened
     * block level tag
     */
    if (this._isClosingTag(line)) {
      this._consumeNode(this.openedTags.pop()!)
      return
    }

    /**
     * Everything from here pushes a new line to the stack before
     * moving forward
     */
    this._pushNewLine()

    /**
     * Check if the current line is a tag or not. If yes, then handle
     * it appropriately
     */
    const tag = getTag(line, this.line, 0, this.tagsDef)
    if (tag) {
      this._handleTagOpening(line, tag)
      return
    }

    /**
     * Check if the current line contains a mustache statement or not. If yes,
     * then handle it appropriately.
     */
    const mustache = getMustache(line, this.line, 0)
    if (mustache) {
      this._handleMustacheOpening(line, mustache)
      return
    }

    /**
     * Otherwise it is a raw line
     */
    this._consumeNode(this._getRawNode(line))
  }

  private _checkForErrors () {
    /**
     * We are done scanning the content and there is an open blockStatement
     * seeking for new content. Which means we are missing a closing
     * brace `)`.
     */
    if (this.blockStatement) {
      const { tag } = this.blockStatement
      throw unclosedParen({ line: tag.line, col: tag.col }, this.options.filename)
    }

    /**
     * We are done scanning the content and there is an open mustache statement
     * seeking for new content. Which means we are missing closing braces `}}`.
     */
    if (this.mustacheStatement) {
      const { mustache } = this.mustacheStatement
      throw unclosedCurlyBrace({ line: mustache.line, col: mustache.col }, this.options.filename)
    }

    /**
     * A tag was opened, but forgot to close it
     */
    if (this.openedTags.length) {
      const openedTag = this.openedTags[this.openedTags.length - 1]
      throw unclosedTag(openedTag.properties.name, openedTag.loc.start, this.options.filename)
    }
  }

  /**
   * Parse the template and generate an AST out of it
   */
  public parse (): void {
    const lines = this.template.split('\n')
    const linesLength = lines.length

    while (this.line < linesLength) {
      const line = lines[this.line]
      this.line++
      this._processText(line)
    }

    this._checkForErrors()
  }
}
