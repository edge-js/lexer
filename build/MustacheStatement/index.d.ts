/**
 * @module Lexer
 */
import { IStatement, IMustacheProp } from '../Contracts';
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
 *   raw: '{{ username }}',
 *   textLeft: 'Hello ',
 *   textRight: '!'
 * }
 * ```
 */
export default class MustacheStatement implements IStatement {
    startPosition: number;
    /**
     * Whether or not the statement has been started. Statement
     * is considered as started, when opening curly braces
     * are detected.
     */
    started: boolean;
    /**
     * Whether or not the statement has been ended. Once ended, you
     * cannot feed more content.
     */
    ended: boolean;
    props: IMustacheProp;
    private firstCall;
    private currentProp;
    private internalBraces;
    private internalProps;
    constructor(startPosition: number);
    /**
     * Feed a new line to be parsed as mustache. For performance it is recommended
     * to check that line contains alteast one `{{` statement and is not escaped
     * before calling this method.
     */
    feed(line: string): void;
    /**
     * Returns the name of the type of the mustache tag. If char and
     * surrounding chars, doesn't form an opening `{{` mustache
     * pattern, then `null` will be returned
     */
    private getName(chars, charCode);
    /**
     * Returns a boolean telling whether the current char and surrounding
     * chars form the closing of mustache.
     */
    private isClosing(chars, charCode);
    /**
     * Returns `true` when seeking for more content.
     */
    readonly seeking: boolean;
    /**
     * Process one char at a time
     */
    private processChar(chars, char);
    /**
     * Sets the value from internal prop to the public prop
     * as a string.
     */
    private setProp();
}
