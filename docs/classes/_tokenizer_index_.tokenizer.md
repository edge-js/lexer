[edge-lexer](../README.md) › ["Tokenizer/index"](../modules/_tokenizer_index_.md) › [Tokenizer](_tokenizer_index_.tokenizer.md)

# Class: Tokenizer

Tokenizer converts a bunch of text into an array of tokens. Later
these tokens can be used to build the transformed text.

Go through the README file to learn more about the syntax and
the tokens output.

## Hierarchy

* **Tokenizer**

## Index

### Constructors

* [constructor](_tokenizer_index_.tokenizer.md#constructor)

### Properties

* [mustacheStatement](_tokenizer_index_.tokenizer.md#mustachestatement)
* [tagStatement](_tokenizer_index_.tokenizer.md#tagstatement)
* [tokens](_tokenizer_index_.tokenizer.md#tokens)

### Methods

* [parse](_tokenizer_index_.tokenizer.md#parse)

## Constructors

###  constructor

\+ **new Tokenizer**(`template`: string, `tagsDef`: [Tags](../interfaces/_contracts_index_.tags.md), `options`: object): *[Tokenizer](_tokenizer_index_.tokenizer.md)*

**Parameters:**

▪ **template**: *string*

▪ **tagsDef**: *[Tags](../interfaces/_contracts_index_.tags.md)*

▪ **options**: *object*

Name | Type |
------ | ------ |
`filename` | string |

**Returns:** *[Tokenizer](_tokenizer_index_.tokenizer.md)*

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

• **tokens**: *[Token](../modules/_contracts_index_.md#token)[]* = []

## Methods

###  parse

▸ **parse**(): *void*

Parse the template and generate an AST out of it

**Returns:** *void*
