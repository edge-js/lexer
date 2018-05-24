/**
 * @module Lexer
 */
import { IProp, IStatement } from '../Contracts';
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
export default class TagStatement implements IStatement {
    startPosition: number;
    private seekable;
    /**
     * Whether or not the statement has been started. This flag
     * is set to true when we detect first `(`.
     */
    started: boolean;
    /**
     * Whether or not statement is ended. This flag is set when last closing
     * `)` is detected.
     */
    ended: boolean;
    /**
     * Prop defines the meta data for a statement
     */
    props: IProp;
    private currentProp;
    private internalParens;
    private internalProps;
    private firstCall;
    constructor(startPosition: number, seekable?: boolean);
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
    feed(line: string): void;
    /**
     * Tells whether statement is seeking for more content
     * or not. When seeking is false, it means the
     * statement has been parsed successfully.
     */
    readonly seeking: boolean;
    /**
     * Returns a boolean telling if charcode should be considered
     * as the start of the statement.
     */
    private isStartOfStatement(charcode);
    /**
     * Returns a boolean telling if charCode should be considered
     * as the end of the statement
     */
    private isEndOfStatement(charcode);
    /**
     * Starts the statement by switching the currentProp to
     * `jsArg` and setting the started flag to true.
     */
    private startStatement();
    /**
     * Ends the statement by switching the ended flag to true. Also
     * if `started` flag was never switched on, then it will throw
     * an exception.
     */
    private endStatement(char);
    /**
     * Feeds character to the currentProp. Also this method will
     * record the toll of `opening` and `closing` parenthesis.
     */
    private feedChar(char, charCode);
    /**
     * Throws exception when end of the statement is reached, but there
     * are more chars to be feeded. This can be because of unclosed
     * statement or following code is not in a new line.
     */
    private ensureNoMoreCharsToFeed(chars);
    /**
     * Sets the prop value for the current Prop and set the
     * corresponding ChatBucket to null.
     */
    private setProp();
    /**
     * Feeds a non-seekable statement
     */
    private feedNonSeekable(line);
    /**
     * Feeds a seekable statement
     */
    private feedSeekable(line);
}
