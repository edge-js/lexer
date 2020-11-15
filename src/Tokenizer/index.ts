/**
 * edge-lexer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getTag, getMustache } from '../Detector'
import { Scanner } from '../Scanner'

import {
	unclosedTag,
	unclosedParen,
	unopenedParen,
	unclosedCurlyBrace,
	cannotSeekStatement,
} from '../Exceptions'

import {
	Tags,
	Token,
	LexerLoc,
	TagToken,
	TagTypes,
	RawToken,
	RuntimeTag,
	CommentToken,
	NewLineToken,
	MustacheTypes,
	MustacheToken,
	RuntimeComment,
	RuntimeMustache,
} from '../Contracts'

/**
 * Tokenizer converts a bunch of text into an array of tokens. Later
 * these tokens can be used to build the transformed text.
 *
 * Go through the README file to learn more about the syntax and
 * the tokens output.
 */
export class Tokenizer {
	public tokens: Token[] = []

	/**
	 * Holds the current tag statement, until it is closed
	 */
	public tagStatement: null | { scanner: Scanner; tag: RuntimeTag } = null

	/**
	 * Holds the current mustache statement, until it is closed
	 */
	public mustacheStatement: null | {
		scanner: Scanner
		mustache: RuntimeMustache | RuntimeComment
	} = null

	/**
	 * Current line number
	 */
	private line: number = 0

	/**
	 * Tracking if two back to back lines are tags or not. Need it for inserting
	 * whitespace between them
	 */
	private isLastLineATag: boolean = false

	/**
	 * When true, the tokenizer will drop the newline
	 */
	private dropNewLine: boolean = false

	/**
	 * An array of opened block level tags
	 */
	private openedTags: TagToken[] = []

	constructor(
		private template: string,
		private tagsDef: Tags,
		private options: { filename: string; onLine?: (line: string) => string }
	) {}

	/**
	 * Returns the raw token
	 */
	private getRawNode(text: string): RawToken {
		return {
			type: 'raw',
			value: text,
			filename: this.options.filename,
			line: this.line,
		}
	}

	/**
	 * Returns the new line token
	 */
	private getNewLineNode(line?: number): NewLineToken {
		return {
			type: 'newline',
			filename: this.options.filename,
			line: (line || this.line) - 1,
		}
	}

	/**
	 * Returns the TagToken for a runtime tag. The `jsArg` and ending
	 * loc is computed using the scanner and must be passed to this
	 * method.
	 */
	private getTagNode(tag: RuntimeTag, jsArg: string, closingLoc: LexerLoc['end']): TagToken {
		return {
			type: tag.escaped ? TagTypes.ETAG : TagTypes.TAG,
			filename: tag.filename,
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
				end: closingLoc,
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
	private consumeTag(tag: RuntimeTag, jsArg: string, loc: LexerLoc['end']) {
		if (tag.block && !tag.selfclosed) {
			this.openedTags.push(this.getTagNode(tag, jsArg, loc))
		} else {
			this.consumeNode(this.getTagNode(tag, jsArg, loc))
		}
	}

	/**
	 * Handles the opening of the tag.
	 */
	private handleTagOpening(line: string, tag: RuntimeTag) {
		if (tag.seekable && !tag.hasBrace) {
			throw unopenedParen({ line: tag.line, col: tag.col }, tag.filename)
		}

		/**
		 * When tag is not seekable, then their is no need to create
		 * a scanner instance, just consume it right away.
		 */
		if (!tag.seekable) {
			this.consumeTag(tag, '', { line: tag.line, col: tag.col })
			if (tag.noNewLine || line.endsWith('~')) {
				this.dropNewLine = true
			}
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
		this.tagStatement = {
			tag: tag,
			scanner: new Scanner(')', ['(', ')'], this.line, tag.col),
		}

		/**
		 * Pass all remaining content to the scanner
		 */
		this.feedCharsToCurrentTag(line.slice(tag.col))
	}

	/**
	 * Scans the string using the scanner and waits for the
	 * closing brace ')' to appear
	 */
	private feedCharsToCurrentTag(content: string) {
		const { tag, scanner } = this.tagStatement!

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
		this.consumeTag(tag, scanner.match, scanner.loc)

		/**
		 * If tag endswith `~`. Then instruct the tokenizer to drop the
		 * next new line
		 */
		if (scanner.leftOver.trim() === '~') {
			this.tagStatement = null
			this.dropNewLine = true
			return
		}

		/**
		 * Raise error, if there is inline content after the closing brace ')'
		 * `@if(username) hello {{ username }}` is invalid
		 */
		if (scanner.leftOver.trim()) {
			throw cannotSeekStatement(scanner.leftOver, scanner.loc, tag.filename)
		}

		/**
		 * Do not add newline when tag instructs for it
		 */
		if (tag.noNewLine) {
			this.dropNewLine = true
		}

		this.tagStatement = null
	}

	/**
	 * Returns the mustache type by checking for `safe` and `escaped`
	 * properties.
	 */
	private getMustacheType(mustache: RuntimeMustache): MustacheTypes {
		if (mustache.safe) {
			return mustache.escaped ? MustacheTypes.ESMUSTACHE : MustacheTypes.SMUSTACHE
		}

		return mustache.escaped ? MustacheTypes.EMUSTACHE : MustacheTypes.MUSTACHE
	}

	/**
	 * Returns the mustache token using the runtime mustache node. The `jsArg` and
	 * ending `loc` is fetched using the scanner.
	 */
	private getMustacheNode(
		mustache: RuntimeMustache,
		jsArg: string,
		closingLoc: LexerLoc['end']
	): MustacheToken {
		return {
			type: this.getMustacheType(mustache),
			filename: mustache.filename,
			properties: {
				jsArg: jsArg,
			},
			loc: {
				start: {
					line: mustache.line,
					col: mustache.col,
				},
				end: closingLoc,
			},
		}
	}

	/**
	 * Returns the comment token using the runtime comment node.
	 */
	private getCommentNode(
		comment: RuntimeComment,
		value: string,
		closingLoc: LexerLoc['end']
	): CommentToken {
		return {
			type: 'comment',
			filename: comment.filename,
			value: value,
			loc: {
				start: {
					line: comment.line,
					col: comment.col,
				},
				end: closingLoc,
			},
		}
	}

	/**
	 * Handles the line which has mustache opening braces.
	 */
	private handleMustacheOpening(line: string, mustache: RuntimeMustache | RuntimeComment) {
		const pattern = mustache.isComment ? '--}}' : mustache.safe ? '}}}' : '}}'
		const textLeftIndex =
			mustache.isComment || !mustache.escaped ? mustache.realCol : mustache.realCol - 1

		/**
		 * Pull everything that is on the left of the mustache
		 * statement and use it as a raw node
		 */
		if (textLeftIndex > 0) {
			this.consumeNode(this.getRawNode(line.slice(0, textLeftIndex)))
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
		this.feedCharsToCurrentMustache(line.slice(mustache.realCol))
	}

	/**
	 * Feed chars to the mustache statement, which isn't closed yet.
	 */
	private feedCharsToCurrentMustache(content: string): void {
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
		if (mustache.isComment) {
			this.consumeNode(this.getCommentNode(mustache, scanner.match, scanner.loc))
		} else {
			this.consumeNode(this.getMustacheNode(mustache, scanner.match, scanner.loc))
		}

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
			/**
			 * Scan for another mustache in the same line
			 */
			const anotherMustache = getMustache(
				scanner.leftOver,
				this.options.filename,
				scanner.loc.line,
				scanner.loc.col
			)
			if (anotherMustache) {
				this.handleMustacheOpening(scanner.leftOver, anotherMustache)
				return
			}

			this.consumeNode(this.getRawNode(scanner.leftOver))
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
	private isClosingTag(line: string): boolean {
		if (!this.openedTags.length) {
			return false
		}

		line = line.trim()

		const recentTag = this.openedTags[this.openedTags.length - 1]
		const endStatement = `@end${recentTag.properties.name}`
		return (
			line === endStatement || line === `${endStatement}~` || line === '@end' || line === '@end~'
		)
	}

	/**
	 * Consume any type of token by moving it to the correct list. If there are
	 * opened tags, then the token becomes part of the tag children. Otherwise
	 * moved as top level token.
	 */
	private consumeNode(tag: Token): void {
		if (this.openedTags.length) {
			this.openedTags[this.openedTags.length - 1].children.push(tag)
			return
		}

		this.tokens.push(tag)
	}

	/**
	 * Pushes a new line to the list. This method avoids
	 * new lines at position 0.
	 */
	private pushNewLine(line?: number) {
		if ((line || this.line) === 1) {
			return
		}

		/**
		 * Ignore incoming new line
		 */
		if (this.dropNewLine) {
			this.dropNewLine = false
			return
		}

		this.consumeNode(this.getNewLineNode(line))
	}

	/**
	 * Process the current line based upon what it is. What it is?
	 * That's the job of this method to find out.
	 */
	private processText(line: string): void {
		/**
		 * Pre process line when the onLine listener is defined
		 */
		if (typeof this.options.onLine === 'function') {
			line = this.options.onLine(line)
		}

		/**
		 * There is an open block statement, so feed line to it
		 */
		if (this.tagStatement) {
			this.feedCharsToCurrentTag('\n')
			this.feedCharsToCurrentTag(line)
			return
		}

		/**
		 * There is an open mustache statement, so feed line to it
		 */
		if (this.mustacheStatement) {
			this.feedCharsToCurrentMustache('\n')
			this.feedCharsToCurrentMustache(line)
			return
		}

		/**
		 * The line is an closing statement for a previously opened
		 * block level tag
		 */
		if (this.isClosingTag(line)) {
			this.consumeNode(this.openedTags.pop()!)

			/**
			 * Do not add next newline when statement ends with `~`
			 */
			if (line.endsWith('~')) {
				this.dropNewLine = true
			}
			return
		}

		/**
		 * Check if the current line is a tag or not. If yes, then handle
		 * it appropriately
		 */
		const tag = getTag(line, this.options.filename, this.line, 0, this.tagsDef)
		if (tag) {
			/**
			 * When two back to back lines are tags, then we put a newline between them
			 * and one can use `skipNewLines` syntax to remove new lines (if required)
			 */
			if (this.isLastLineATag) {
				this.pushNewLine()
			}

			this.isLastLineATag = true
			this.handleTagOpening(line, tag)
			return
		}

		this.isLastLineATag = false

		/**
		 * Check if the current line contains a mustache statement or not. If yes,
		 * then handle it appropriately.
		 */
		const mustache = getMustache(line, this.options.filename, this.line, 0)
		if (mustache) {
			this.pushNewLine()
			this.handleMustacheOpening(line, mustache)
			return
		}

		this.pushNewLine()
		this.consumeNode(this.getRawNode(line))
	}

	/**
	 * Checks for errors after the tokenizer completes it's work, so that we
	 * can find broken statements or unclosed tags.
	 */
	private checkForErrors() {
		/**
		 * We are done scanning the content and there is an open tagStatement
		 * seeking for new content. Which means we are missing a closing
		 * brace `)`.
		 */
		if (this.tagStatement) {
			const { tag } = this.tagStatement
			throw unclosedParen({ line: tag.line, col: tag.col }, tag.filename)
		}

		/**
		 * We are done scanning the content and there is an open mustache statement
		 * seeking for new content. Which means we are missing closing braces `}}`.
		 */
		if (this.mustacheStatement) {
			const { mustache } = this.mustacheStatement
			throw unclosedCurlyBrace({ line: mustache.line, col: mustache.col }, mustache.filename)
		}

		/**
		 * A tag was opened, but forgot to close it
		 */
		if (this.openedTags.length) {
			const openedTag = this.openedTags[this.openedTags.length - 1]
			throw unclosedTag(openedTag.properties.name, openedTag.loc.start, openedTag.filename)
		}
	}

	/**
	 * Parse the template and generate an AST out of it
	 */
	public parse(): void {
		const lines = this.template.split(/\r\n|\r|\n/g)
		const linesLength = lines.length

		while (this.line < linesLength) {
			const line = lines[this.line]
			this.line++
			this.processText(line)
		}

		this.checkForErrors()
	}
}
