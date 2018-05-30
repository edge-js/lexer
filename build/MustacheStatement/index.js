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
const OPENING_BRACE = 123;
/** @hidden */
const CLOSING_BRACE = 125;
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
class MustacheStatement {
    constructor(startPosition) {
        this.startPosition = startPosition;
        /**
         * Whether or not the statement has been started. Statement
         * is considered as started, when opening curly braces
         * are detected.
         */
        this.started = false;
        /**
         * Whether or not the statement has been ended. Once ended, you
         * cannot feed more content.
         */
        this.ended = false;
        this.firstCall = true;
        this.currentProp = 'textLeft';
        this.internalBraces = 0;
        this.props = {
            name: null,
            jsArg: '',
            raw: '',
            textLeft: '',
            textRight: '',
        };
        this.internalProps = {
            jsArg: new CharBucket(Contracts_1.WhiteSpaceModes.ALL),
            textLeft: new CharBucket(Contracts_1.WhiteSpaceModes.ALL),
            textRight: new CharBucket(Contracts_1.WhiteSpaceModes.ALL),
        };
    }
    /**
     * Feed a new line to be parsed as mustache. For performance it is recommended
     * to check that line contains alteast one `{{` statement and is not escaped
     * before calling this method.
     */
    feed(line) {
        if (this.ended) {
            throw new Error(`Unexpected token {${line}}`);
        }
        /**
         * If feed method is called consecutively, we need to append
         * new lines
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
         * Loop over all the characters and parse line
         */
        const chars = line.split('');
        while (chars.length) {
            const char = chars.shift();
            this.processChar(chars, char);
        }
        /**
         * If not seeking, then set the last prop
         */
        if (!this.seeking) {
            this.setProp();
            this.internalProps = null;
        }
    }
    /**
     * Returns a boolean telling, if value is a safe mustache or
     * escaped safe mustache type.
     */
    isSafeMustache(value) {
        return [Contracts_1.MustacheType.SMUSTACHE, Contracts_1.MustacheType.ESMUSTACHE].indexOf(value) !== -1;
    }
    /**
     * Returns a boolean telling, if value is a mustache or
     * escaped mustache type.
     */
    isMustache(value) {
        return [Contracts_1.MustacheType.MUSTACHE, Contracts_1.MustacheType.EMUSTACHE].indexOf(value) !== -1;
    }
    /**
     * Returns the name of the type of the mustache tag. If char and
     * surrounding chars, doesn't form an opening `{{` mustache
     * pattern, then `null` will be returned
     */
    getName(chars, charCode) {
        if (charCode !== OPENING_BRACE || !chars.length) {
            return null;
        }
        let next = chars[0].charCodeAt(0);
        /**
         * Will be considered as mustache, when consecutive chars
         * are {{
         */
        const isMustache = next === OPENING_BRACE;
        if (!isMustache) {
            return null;
        }
        /**
         * If mustache braces were escaped, then we need to ignore them
         * and set the prop name properly
         */
        const isEscaped = this.internalProps.textLeft.lastChar === '@';
        if (isEscaped) {
            this.internalProps.textLeft.pop();
        }
        chars.shift();
        if (!chars.length) {
            return isEscaped ? Contracts_1.MustacheType.EMUSTACHE : Contracts_1.MustacheType.MUSTACHE;
        }
        /**
         * Will be considered as `safe mustache`, when consecutive
         * chars are {{{
         */
        next = chars[0].charCodeAt(0);
        const isEMustache = next === OPENING_BRACE;
        if (!isEMustache) {
            return isEscaped ? Contracts_1.MustacheType.EMUSTACHE : Contracts_1.MustacheType.MUSTACHE;
        }
        chars.shift();
        return isEscaped ? Contracts_1.MustacheType.ESMUSTACHE : Contracts_1.MustacheType.SMUSTACHE;
    }
    /**
     * Returns a boolean telling whether the current char and surrounding
     * chars form the closing of mustache.
     */
    isClosing(chars, charCode) {
        if (charCode !== CLOSING_BRACE || this.internalBraces !== 0) {
            return false;
        }
        /**
         * If opening statement was detected as `emustache`, then expect
         * 2 more consecutive chars as CLOSING_BRACE
         */
        if (this.isSafeMustache(this.props.name) && chars.length >= 2) {
            const next = chars[0].charCodeAt(0);
            const nextToNext = chars[1].charCodeAt(0);
            if (next === CLOSING_BRACE && nextToNext === CLOSING_BRACE) {
                chars.shift();
                chars.shift();
                return true;
            }
            return false;
        }
        /**
         * If opening statement was detected as `mustache`, then expect
         * 1 more consecutive char as CLOSING_BRACE
         */
        if (this.isMustache(this.props.name) && chars.length >= 1) {
            const next = chars[0].charCodeAt(0);
            if (next === CLOSING_BRACE) {
                chars.shift();
                return true;
            }
            return false;
        }
        return false;
    }
    /**
     * Returns `true` when seeking for more content.
     */
    get seeking() {
        return this.started && !this.ended;
    }
    /**
     * Process one char at a time
     */
    processChar(chars, char) {
        let name = null;
        const charCode = char.charCodeAt(0);
        /**
         * Only process name, when are not in inside mustache
         * statement.
         */
        if (!this.started) {
            name = this.getName(chars, charCode);
        }
        /**
         * When a name is found, we consider it as a start
         * of `mustache` statement
         */
        if (name) {
            this.props.name = name;
            this.started = true;
            this.setProp();
            this.currentProp = 'jsArg';
            return;
        }
        /**
         * If statement was started and not ended and is a closing
         * tag, then close mustache
         */
        if (this.started && !this.ended && this.isClosing(chars, charCode)) {
            this.setProp();
            this.currentProp = 'textRight';
            this.ended = true;
            return;
        }
        if (charCode === OPENING_BRACE) {
            this.internalBraces++;
        }
        if (charCode === CLOSING_BRACE) {
            this.internalBraces--;
        }
        this.internalProps[this.currentProp].feed(char);
    }
    /**
     * Sets the value from internal prop to the public prop
     * as a string.
     */
    setProp() {
        this.props[this.currentProp] = this.internalProps[this.currentProp].get();
    }
}
module.exports = MustacheStatement;
