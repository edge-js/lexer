**[edge-lexer](../README.md)**

> [Globals](../README.md) / [src/Tokenizer](../modules/src_tokenizer.md) / Tokenizer

# Class: Tokenizer

Tokenizer converts a bunch of text into an array of tokens. Later
these tokens can be used to build the transformed text.

Go through the README file to learn more about the syntax and
the tokens output.

## Hierarchy

* **Tokenizer**

## Index

### Constructors

* [constructor](src_tokenizer.tokenizer.md#constructor)

### Properties

* [mustacheStatement](src_tokenizer.tokenizer.md#mustachestatement)
* [tagStatement](src_tokenizer.tokenizer.md#tagstatement)
* [tokens](src_tokenizer.tokenizer.md#tokens)

### Methods

* [parse](src_tokenizer.tokenizer.md#parse)

## Constructors

### constructor

\+ **new Tokenizer**(`template`: string, `tagsDef`: [Tags](../interfaces/src_contracts.tags.md), `options`: { filename: string  }): [Tokenizer](src_tokenizer.tokenizer.md)

#### Parameters:

Name | Type |
------ | ------ |
`template` | string |
`tagsDef` | [Tags](../interfaces/src_contracts.tags.md) |
`options` | { filename: string  } |

**Returns:** [Tokenizer](src_tokenizer.tokenizer.md)

## Properties

### mustacheStatement

•  **mustacheStatement**: null \| { mustache: [RuntimeMustache](../modules/src_contracts.md#runtimemustache) \| [RuntimeComment](../modules/src_contracts.md#runtimecomment) ; scanner: [Scanner](src_scanner.scanner.md)  } = null

Holds the current mustache statement, until it is closed

___

### tagStatement

•  **tagStatement**: null \| { scanner: [Scanner](src_scanner.scanner.md) ; tag: [RuntimeTag](../modules/src_contracts.md#runtimetag)  } = null

Holds the current tag statement, until it is closed

___

### tokens

•  **tokens**: [Token](../modules/src_contracts.md#token)[] = []

## Methods

### parse

▸ **parse**(): void

Parse the template and generate an AST out of it

**Returns:** void
