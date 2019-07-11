> **[edge-lexer](../README.md)**

[Globals](../globals.md) / [lexer](../modules/lexer.md) / [Tokenizer](lexer.tokenizer.md) /

# Class: Tokenizer

Tokenizer converts a bunch of text into an array of tokens. Later
these tokens can be used to build the transformed text.

Go through the README file to learn more about the syntax and
the tokens output.

## Hierarchy

* **Tokenizer**

### Index

#### Constructors

* [constructor](lexer.tokenizer.md#constructor)

#### Properties

* [tokens](lexer.tokenizer.md#tokens)

#### Methods

* [parse](lexer.tokenizer.md#parse)

## Constructors

###  constructor

\+ **new Tokenizer**(`_template`: string, `_tagsDef`: [Tags](../modules/lexer.md#tags), `_options`: `tokenizerOptions`): *[Tokenizer](lexer.tokenizer.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_template` | string |
`_tagsDef` | [Tags](../modules/lexer.md#tags) |
`_options` | `tokenizerOptions` |

**Returns:** *[Tokenizer](lexer.tokenizer.md)*

## Properties

###  tokens

• **tokens**: *[Token](../modules/lexer.md#token)[]* =  []

## Methods

###  parse

▸ **parse**(): *void*

Parse the template and generate an AST out of it

**Returns:** *void*