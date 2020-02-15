[edge-lexer](../README.md) › [lexer](lexer.md)

# External module: lexer

## Index

### Enumerations

* [MustacheTypes](../enums/lexer.mustachetypes.md)
* [TagTypes](../enums/lexer.tagtypes.md)

### Classes

* [Scanner](../classes/lexer.scanner.md)
* [Tokenizer](../classes/lexer.tokenizer.md)

### Interfaces

* [LexerTagDefinitionContract](../interfaces/lexer.lexertagdefinitioncontract.md)
* [Tags](../interfaces/lexer.tags.md)

### Type aliases

* [LexerLoc](lexer.md#lexerloc)
* [MustacheProps](lexer.md#mustacheprops)
* [MustacheToken](lexer.md#mustachetoken)
* [NewLineToken](lexer.md#newlinetoken)
* [RawToken](lexer.md#rawtoken)
* [RuntimeMustache](lexer.md#runtimemustache)
* [RuntimeTag](lexer.md#runtimetag)
* [TagProps](lexer.md#tagprops)
* [TagToken](lexer.md#tagtoken)
* [Token](lexer.md#token)

### Functions

* [cannotSeekStatement](lexer.md#cannotseekstatement)
* [getMustache](lexer.md#getmustache)
* [getTag](lexer.md#gettag)
* [unclosedCurlyBrace](lexer.md#unclosedcurlybrace)
* [unclosedParen](lexer.md#unclosedparen)
* [unclosedTag](lexer.md#unclosedtag)
* [unopenedParen](lexer.md#unopenedparen)

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

* **loc**: *[LexerLoc](lexer.md#lexerloc)*

* **properties**: *[MustacheProps](lexer.md#mustacheprops)*

* **type**: *[MustacheTypes](../enums/lexer.mustachetypes.md)*

___

###  NewLineToken

Ƭ **NewLineToken**: *object*

New line token

#### Type declaration:

* **line**: *number*

* **type**: *"newline"*

___

###  RawToken

Ƭ **RawToken**: *object*

Raw line token

#### Type declaration:

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

* **children**: *[Token](lexer.md#token)[]*

* **loc**: *[LexerLoc](lexer.md#lexerloc)*

* **properties**: *[TagProps](lexer.md#tagprops)*

* **type**: *[TagTypes](../enums/lexer.tagtypes.md)*

___

###  Token

Ƭ **Token**: *[RawToken](lexer.md#rawtoken) | [NewLineToken](lexer.md#newlinetoken) | [TagToken](lexer.md#tagtoken) | [MustacheToken](lexer.md#mustachetoken)*

## Functions

###  cannotSeekStatement

▸ **cannotSeekStatement**(`chars`: string, `pos`: object, `filename`: string): *EdgeError*

Raised when there is inline content next to a tag opening
block. For example:

Incorrect
```
@if(username) Hello {{ username }} @endif
```

Correct
```
@if(username)
  Hello {{ username }}
@endif
```

**Parameters:**

▪ **chars**: *string*

▪ **pos**: *object*

Name | Type |
------ | ------ |
`col` | number |
`line` | number |

▪ **filename**: *string*

**Returns:** *EdgeError*

___

###  getMustache

▸ **getMustache**(`content`: string, `line`: number, `col`: number): *[RuntimeMustache](lexer.md#runtimemustache) | null*

Returns the runtime mustache node if mustache is detected

**Parameters:**

Name | Type |
------ | ------ |
`content` | string |
`line` | number |
`col` | number |

**Returns:** *[RuntimeMustache](lexer.md#runtimemustache) | null*

___

###  getTag

▸ **getTag**(`content`: string, `line`: number, `col`: number, `tags`: [Tags](../interfaces/lexer.tags.md)): *[RuntimeTag](lexer.md#runtimetag) | null*

Returns runtime tag node if tag is detected and is a registered tag

**Parameters:**

Name | Type |
------ | ------ |
`content` | string |
`line` | number |
`col` | number |
`tags` | [Tags](../interfaces/lexer.tags.md) |

**Returns:** *[RuntimeTag](lexer.md#runtimetag) | null*

___

###  unclosedCurlyBrace

▸ **unclosedCurlyBrace**(`pos`: object, `filename`: string): *EdgeError*

Raised when the curly closing brace is missing from the mustache
statement. For example:

Incorrect
```
{{ username }
```

Correct

```
{{ username }}
```

**Parameters:**

▪ **pos**: *object*

Name | Type |
------ | ------ |
`col` | number |
`line` | number |

▪ **filename**: *string*

**Returns:** *EdgeError*

___

###  unclosedParen

▸ **unclosedParen**(`pos`: object, `filename`: string): *EdgeError*

Raised when a tag opening body doesn't have a closing brace. For example:

Incorrect
```
@if(username
```

Correct
```
@if(username)
```

**Parameters:**

▪ **pos**: *object*

Name | Type |
------ | ------ |
`col` | number |
`line` | number |

▪ **filename**: *string*

**Returns:** *EdgeError*

___

###  unclosedTag

▸ **unclosedTag**(`tag`: string, `pos`: object, `filename`: string): *EdgeError*

Raised when a block level tag is opened but never closed. For example:

Incorrect
```
@if(username)
```

Correct
```
@if(username)
@endif
```

**Parameters:**

▪ **tag**: *string*

▪ **pos**: *object*

Name | Type |
------ | ------ |
`col` | number |
`line` | number |

▪ **filename**: *string*

**Returns:** *EdgeError*

___

###  unopenedParen

▸ **unopenedParen**(`pos`: object, `filename`: string): *EdgeError*

Raised when a tag is used without an opening brace. For example:

Incorrect
```
@if username
```

Correct
```
@if(username)
```

**Parameters:**

▪ **pos**: *object*

Name | Type |
------ | ------ |
`col` | number |
`line` | number |

▪ **filename**: *string*

**Returns:** *EdgeError*
