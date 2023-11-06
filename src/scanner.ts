/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Scan a string and seperate it into 2 pairs. The first pair will be series
 * of characters until the ending pattern is found and 2nd pair is the
 * left over.
 *
 * Their are some special behaviors over the regular `string.split` method.
 *
 * 1. Multiple lines can be passed by calling `scan` method for each line.
 * 2. Tolerates characters when they conflict with the ending pattern.
 *
 * ```js
 * const pattern = ')'
 * const tolerations = ['(', ')']
 * const scanner = new Scanner(pattern, tolerations)
 *
 * scanner.scan('2 + 2 * (3))')
 * if (scanner.closed) {
 *   scanner.match // 2 + 2 * (3)
 *   scanner.leftOver // ''
 * }
 * ```
 *
 * If we take the same string `2 + 2 * (3))` and split it using ')', then we
 * will get unexpected result, since the split method splits by finding the
 * first match.
 */
export class Scanner {
  #pattern: string

  #tolaretionCounts: number = 0
  #tolerateLhs: string = ''
  #tolerateRhs: string = ''
  #patternLength: number = 0

  /**
   * Tracking if the scanner has been closed
   */
  closed: boolean = false

  /**
   * The matched content within the pattern
   */
  match: string = ''

  /**
   * The content in the same line but after the closing
   * of the pattern
   */
  leftOver: string = ''

  loc: { line: number; col: number }

  constructor(pattern: string, toleratePair: [string, string], line: number, col: number) {
    this.#tolerateLhs = toleratePair[0]
    this.#tolerateRhs = toleratePair[1]
    this.#patternLength = pattern.length
    this.#pattern = pattern
    this.loc = {
      line: line,
      col: col,
    }
  }

  /**
   * Returns a boolean telling if the pattern matches the current
   * char and the upcoming chars or not.
   *
   * This will be used to mark the scanner as closed and stop scanning
   * for more chars
   */
  #matchesPattern(chars: string, iterationCount: number) {
    for (let i = 0; i < this.#patternLength; i++) {
      if (this.#pattern[i] !== chars[iterationCount + i]) {
        return false
      }
    }

    return true
  }

  /**
   * Scan a string and look for the closing pattern. The string will
   * be seperated with the closing pattern and also tracks the
   * toleration patterns to make sure they are not making the
   * scanner to end due to pattern mis-match.
   */
  scan(chunk: string): void {
    if (chunk === '\n') {
      this.loc.line++
      this.loc.col = 0
      this.match += '\n'
      return
    }

    if (!chunk.trim()) {
      return
    }

    const chunkLength = chunk.length
    let iterations = 0

    while (iterations < chunkLength) {
      const char = chunk[iterations]

      /**
       * Toleration count is 0 and closing pattern matches the current
       * or series of upcoming characters
       */
      if (this.#tolaretionCounts === 0 && this.#matchesPattern(chunk, iterations)) {
        iterations += this.#patternLength
        this.closed = true
        break
      }

      /**
       * Increments the tolarate counts when char is the
       * tolerate lhs character
       */
      if (char === this.#tolerateLhs) {
        this.#tolaretionCounts++
      }

      /**
       * Decrements the tolare counts when char is the
       * tolerate rhs character
       */
      if (char === this.#tolerateRhs) {
        this.#tolaretionCounts--
      }

      /**
       * Append to the matched string and waiting for the
       * closing pattern
       */
      this.match += char

      iterations++
    }

    /**
     * If closed, then return the matched string and also the
     * left over string
     */
    if (this.closed) {
      this.loc.col += iterations
      this.leftOver = chunk.slice(iterations)
    }
  }
}
