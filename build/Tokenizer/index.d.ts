/**
 * @module Lexer
 */
import { INode, IBlockNode } from '../Contracts';
/**
 * Tokenizer converts a bunch of text into an array of tokens. Later
 * these tokens can be used to build the transformed text.
 *
 * Go through the README file to learn more about the syntax and
 * the tokens output.
 */
declare class Tokenizer {
    private template;
    private tagsDef;
    tokens: Array<INode | IBlockNode>;
    private blockStatement;
    private mustacheStatement;
    private line;
    private openedTags;
    constructor(template: string, tagsDef: {
        key: string;
        ITagDefination: any;
    });
    /**
     * Parses the AST
     */
    parse(): void;
    /**
     * Returns the tag defination when line matches the regex
     * of a tag.
     */
    private getTag;
    /**
     * Returns the node for a tag
     */
    private getTagNode;
    /**
     * Returns the node for a raw string
     */
    private getRawNode;
    /**
     * Returns the node for a newline
     */
    private getBlankLineNode;
    /**
     * Returns the mustache node
     */
    private getMustacheNode;
    /**
     * Returns a boolean, when line content is a closing
     * tag
     */
    private isClosingTag;
    /**
     * Returns a boolean, telling if a given statement is seeking
     * for more content or not
     */
    private isSeeking;
    /**
     * Returns a boolean, telling if a given statement has ended or
     * not.
     */
    private isSeeked;
    /**
     * Here we add the node to tokens or as children for
     * the recentOpenedTag (if one exists).
     */
    private consumeNode;
    /**
     * Feeds the text to the currently opened block statement.
     * Make sure that `seeking` is true on the block
     * statement, before calling this method.
     */
    private feedTextToBlockStatement;
    /**
     * Feeds text to the currently opened mustache statement. Make sure
     * to check `seeking` is true, before calling this method.
     */
    private feedTextToMustacheStatement;
    /**
     * Process a piece of text, by finding if text has reserved keywords,
     * otherwise process it as a raw node.
     */
    private processText;
}
export = Tokenizer;
