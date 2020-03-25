[edge-lexer](../README.md) › ["Contracts/index"](_contracts_index_.md)

# Module: "Contracts/index"

edge-lexer

(c) Harminder Virk <virk@adonisjs.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.

## Index

### Enumerations

* [MustacheTypes](../enums/_contracts_index_.mustachetypes.md)
* [TagTypes](../enums/_contracts_index_.tagtypes.md)

### Interfaces

* [LexerTagDefinitionContract](../interfaces/_contracts_index_.lexertagdefinitioncontract.md)
* [Tags](../interfaces/_contracts_index_.tags.md)

### Type aliases

* [LexerLoc](_contracts_index_.md#lexerloc)
* [MustacheProps](_contracts_index_.md#mustacheprops)
* [MustacheToken](_contracts_index_.md#mustachetoken)
* [NewLineToken](_contracts_index_.md#newlinetoken)
* [RawToken](_contracts_index_.md#rawtoken)
* [RuntimeMustache](_contracts_index_.md#runtimemustache)
* [RuntimeTag](_contracts_index_.md#runtimetag)
* [TagProps](_contracts_index_.md#tagprops)
* [TagToken](_contracts_index_.md#tagtoken)
* [Token](_contracts_index_.md#token)

## Type aliases

###  LexerLoc

Ƭ **LexerLoc**: *object*

Location node for tags and mustache braces

#### Type declaration:

* **end**(): *object*

  * **col**: *number*

  * **line**: *number*

* **start**(): *object*

  * **col**: *number*

  * **line**: *number*

___

###  MustacheProps

Ƭ **MustacheProps**: *object*

Properties for a mustache block

#### Type declaration:

* **jsArg**: *string*

___

###  MustacheToken

Ƭ **MustacheToken**: *object*

Mustache token

#### Type declaration:

* **filename**: *string*

* **loc**: *[LexerLoc](_contracts_index_.md#lexerloc)*

* **properties**: *[MustacheProps](_contracts_index_.md#mustacheprops)*

* **type**: *[MustacheTypes](../enums/_contracts_index_.mustachetypes.md)*

___

###  NewLineToken

Ƭ **NewLineToken**: *object*

New line token

#### Type declaration:

* **filename**: *string*

* **line**: *number*

* **type**: *"newline"*

___

###  RawToken

Ƭ **RawToken**: *object*

Raw line token

#### Type declaration:

* **filename**: *string*

* **line**: *number*

* **type**: *"raw"*

* **value**: *string*

___

###  RuntimeMustache

Ƭ **RuntimeMustache**: *object*

Runtime mustache node to know the shape of the mustache

#### Type declaration:

* **col**: *number*

* **escaped**: *boolean*

* **filename**: *string*

* **line**: *number*

* **realCol**: *number*

* **safe**: *boolean*

___

###  RuntimeTag

Ƭ **RuntimeTag**: *object*

The runtime tag node to know the shape of a tag

#### Type declaration:

* **block**: *boolean*

* **col**: *number*

* **escaped**: *boolean*

* **filename**: *string*

* **hasBrace**: *boolean*

* **line**: *number*

* **name**: *string*

* **seekable**: *boolean*

* **selfclosed**: *boolean*

___

###  TagProps

Ƭ **TagProps**: *object*

Properties node for a tag

#### Type declaration:

* **jsArg**: *string*

* **name**: *string*

* **selfclosed**: *boolean*

___

###  TagToken

Ƭ **TagToken**: *object*

Tag token

#### Type declaration:

* **children**: *[Token](_contracts_index_.md#token)[]*

* **filename**: *string*

* **loc**: *[LexerLoc](_contracts_index_.md#lexerloc)*

* **properties**: *[TagProps](_contracts_index_.md#tagprops)*

* **type**: *[TagTypes](../enums/_contracts_index_.tagtypes.md)*

___

###  Token

Ƭ **Token**: *[RawToken](_contracts_index_.md#rawtoken) | [NewLineToken](_contracts_index_.md#newlinetoken) | [TagToken](_contracts_index_.md#tagtoken) | [MustacheToken](_contracts_index_.md#mustachetoken)*
