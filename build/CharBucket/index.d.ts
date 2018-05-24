import { WhiteSpaceModes } from '../Contracts';
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
    private whitespace;
    lastChar: string;
    private chars;
    constructor(whitespace: WhiteSpaceModes);
    /**
     * Returns all chars recorded so far
     *
     * @returns string
     */
    get(): string;
    /**
     * Feed a char to the bucket
     */
    feed(char: string): void;
    /**
     * Remove last character from the string
     */
    pop(): void;
}
