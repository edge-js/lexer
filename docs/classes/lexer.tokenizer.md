[edge-lexer](../README.md) › [lexer](../modules/lexer.md) › [Tokenizer](lexer.tokenizer.md)

# Class: Tokenizer

Tokenizer converts a bunch of text into an array of tokens. Later
these tokens can be used to build the transformed text.

Go through the README file to learn more about the syntax and
the tokens output.

## Hierarchy

* **Tokenizer**

## Index

### Constructors

* [constructor](lexer.tokenizer.md#constructor)

### Properties

* [mustacheStatement](lexer.tokenizer.md#mustachestatement)
* [tagStatement](lexer.tokenizer.md#tagstatement)
* [tokens](lexer.tokenizer.md#tokens)

### Methods

* [parse](lexer.tokenizer.md#parse)

## Constructors

###  constructor

\+ **new Tokenizer**(`template`: string, `tagsDef`: [Tags](../interfaces/lexer.tags.md), `options`: object): *[Tokenizer](lexer.tokenizer.md)*

**Parameters:**

▪ **template**: *string*

▪ **tagsDef**: *[Tags](../interfaces/lexer.tags.md)*

▪ **options**: *object*

Name | Type |
------ | ------ |
`filename` | string |

**Returns:** *[Tokenizer](lexer.tokenizer.md)*

## Properties

###  mustacheStatement

• **mustacheStatement**: *null | object* = null

Holds the current tag statement, until it is closed

___

###  tagStatement

• **tagStatement**: *null | object* = null

Holds the current tag statement, until it is closed

___

###  tokens

• **tokens**: *[Token](../modules/lexer.md#token)[]* = []

## Methods

###  parse

▸ **parse**(): *void*

Parse the template and generate an AST out of it

**Returns:** *void*
