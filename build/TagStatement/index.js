"use strict";
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
const Contracts_1 = require("../Contracts");
const CharBucket = require("../CharBucket");
/** @hidden */
const OPENING_BRACE = 40;
/** @hidden */
const CLOSING_BRACE = 41;
/**
 * The tag statement parses multiline content inside
 * an edge tag starting block.
 *
 * ```
 * const statement = new TagStatement(1)
 * statement.feed('@if(')
 * statement.feed('username')
 * statement.feed(')')
 *
 * console.log(statement.props)
 * {
 *   name: 'if',
 *   jsArg: ' username ',
 *   raw: 'if(\nusername\n)'
 * }
 * ```
 */
class TagStatement {
    constructor(startPosition, tagDef) {
        this.startPosition = startPosition;
        this.tagDef = tagDef;
        /**
         * Whether or not the statement has been started. This flag
         * is set to true when we detect first `(`.
         */
        this.started = false;
        /**
         * Whether or not statement is ended. This flag is set when last closing
         * `)` is detected.
         */
        this.ended = false;
        this.currentProp = 'name';
        this.internalParens = 0;
        this.firstCall = true;
        this.props = {
            name: '',
            jsArg: '',
            raw: '',
        };
        this.internalProps = {
            name: new CharBucket(Contracts_1.WhiteSpaceModes.NONE),
            jsArg: new CharBucket(Contracts_1.WhiteSpaceModes.ALL),
        };
    }
    /**
     * Feed a new line to be tokenized into a statement.
     * This method will collapse all whitespaces.
     *
     * ```js
     * statement.feed('if(2 + 2 === 4)')
     *
     * statement.ended // true
     * statement.props.name // if
     * statement.props.jsArg // 2+2===4
     * ```
     */
    feed(line) {
        if (this.ended) {
            throw new Error(`Unexpected token {${line}}. Write in a new line`);
        }
        /**
         * If feed is called consecutively, then we need to append
         * a new line to the current prop and the raw prop
         */
        if (!this.firstCall) {
            this.props.raw += `\n${line}`;
            this.internalProps[this.currentProp].feed('\n');
        }
        else {
            this.props.raw += line;
            this.firstCall = false;
        }
        /**
         * If statement doesn't seek for args, then end it
         * write their
         */
        if (!this.tagDef.seekable) {
            this.feedNonSeekable(line);
            return;
        }
        /**
         * Feed a seekable string by tokenizing it
         */
        this.feedSeekable(line);
    }
    /**
     * Tells whether statement is seeking for more content
     * or not. When seeking is false, it means the
     * statement has been parsed successfully.
     */
    get seeking() {
        return !this.started || !this.ended;
    }
    /**
     * Returns a boolean telling if charcode should be considered
     * as the start of the statement.
     */
    isStartOfStatement(charcode) {
        return charcode === OPENING_BRACE && this.currentProp === 'name';
    }
    /**
     * Returns a boolean telling if charCode should be considered
     * as the end of the statement
     */
    isEndOfStatement(charcode) {
        return charcode === CLOSING_BRACE && this.internalParens === 0;
    }
    /**
     * Starts the statement by switching the currentProp to
     * `jsArg` and setting the started flag to true.
     */
    startStatement() {
        this.setProp();
        this.currentProp = 'jsArg';
        this.started = true;
    }
    /**
     * Ends the statement by switching the ended flag to true. Also
     * if `started` flag was never switched on, then it will throw
     * an exception.
     */
    endStatement(char) {
        if (!this.started) {
            throw new Error(`Unexpected token ${char}. Wrap statement inside ()`);
        }
        this.ended = true;
        this.setProp();
        this.internalProps = null;
    }
    /**
     * Feeds character to the currentProp. Also this method will
     * record the toll of `opening` and `closing` parenthesis.
     */
    feedChar(char, charCode) {
        if (charCode === OPENING_BRACE) {
            this.internalParens++;
        }
        if (charCode === CLOSING_BRACE) {
            this.internalParens--;
        }
        /**
         * Ignore ! when tag is selfclosed and currentProp is name
         */
        if (this.currentProp === 'name' && char === '!' && this.tagDef.selfclosed) {
            return;
        }
        this.internalProps[this.currentProp].feed(char);
    }
    /**
     * Throws exception when end of the statement is reached, but there
     * are more chars to be feeded. This can be because of unclosed
     * statement or following code is not in a new line.
     */
    ensureNoMoreCharsToFeed(chars) {
        if (chars.length) {
            throw new Error(`Unexpected token {${chars.join('')}}. Write in a new line`);
        }
    }
    /**
     * Sets the prop value for the current Prop and set the
     * corresponding ChatBucket to null.
     */
    setProp() {
        this.props[this.currentProp] = this.internalProps[this.currentProp].get();
    }
    /**
     * Feeds a non-seekable statement
     */
    feedNonSeekable(line) {
        this.props.name = line.trim();
        this.ended = true;
        this.started = true;
        this.internalProps = null;
    }
    /**
     * Feeds a seekable statement
     */
    feedSeekable(line) {
        const chars = line.split('');
        while (chars.length) {
            const char = chars.shift();
            const charCode = char.charCodeAt(0);
            if (this.isStartOfStatement(charCode)) {
                this.startStatement();
            }
            else if (this.isEndOfStatement(charCode)) {
                this.ensureNoMoreCharsToFeed(chars);
                this.endStatement(char);
                break;
            }
            else {
                this.feedChar(char, charCode);
            }
        }
        if (!this.seeking) {
            this.internalProps = null;
        }
    }
}
module.exports = TagStatement;
