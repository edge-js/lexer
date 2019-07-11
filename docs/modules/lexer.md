> **[edge-lexer](../README.md)**

[Globals](../README.md) / [lexer](lexer.md) /

# External module: lexer

### Index

#### Enumerations

* [MustacheTypes](../enums/lexer.mustachetypes.md)
* [TagTypes](../enums/lexer.tagtypes.md)

#### Classes

* [Scanner](../classes/lexer.scanner.md)
* [Tokenizer](../classes/lexer.tokenizer.md)

#### Type aliases

* [LexerLoc](lexer.md#lexerloc)
* [LexerTagDefinition](lexer.md#lexertagdefinition)
* [MustacheProps](lexer.md#mustacheprops)
* [MustacheToken](lexer.md#mustachetoken)
* [NewLineToken](lexer.md#newlinetoken)
* [RawToken](lexer.md#rawtoken)
* [RuntimeMustache](lexer.md#runtimemustache)
* [RuntimeTag](lexer.md#runtimetag)
* [TagProps](lexer.md#tagprops)
* [TagToken](lexer.md#tagtoken)
* [Tags](lexer.md#tags)
* [Token](lexer.md#token)

#### Functions

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

___

###  LexerTagDefinition

Ƭ **LexerTagDefinition**: *object*

The properties required by the lexer on a tag
definition

#### Type declaration:

___

###  MustacheProps

Ƭ **MustacheProps**: *object*

Properties for a mustache block

#### Type declaration:

___

###  MustacheToken

Ƭ **MustacheToken**: *object*

Mustache token

#### Type declaration:

___

###  NewLineToken

Ƭ **NewLineToken**: *object*

New line token

#### Type declaration:

___

###  RawToken

Ƭ **RawToken**: *object*

Raw line token

#### Type declaration:

___

###  RuntimeMustache

Ƭ **RuntimeMustache**: *object*

Runtime mustache node to know the shape of the mustache

#### Type declaration:

___

###  RuntimeTag

Ƭ **RuntimeTag**: *object*

The runtime tag node to know the shape of a tag

#### Type declaration:

___

###  TagProps

Ƭ **TagProps**: *object*

Properties node for a tag

#### Type declaration:

___

###  TagToken

Ƭ **TagToken**: *object*

Tag token

#### Type declaration:

___

###  Tags

Ƭ **Tags**: *object*

Tags registered with the lexer to be scanned

#### Type declaration:

● \[▪ **name**: *string*\]: [LexerTagDefinition](lexer.md#lexertagdefinition)

___

###  Token

Ƭ **Token**: *[RawToken](lexer.md#rawtoken) | [NewLineToken](lexer.md#newlinetoken) | [TagToken](lexer.md#tagtoken) | [MustacheToken](lexer.md#mustachetoken)*

## Functions

###  cannotSeekStatement

▸ **cannotSeekStatement**(`chars`: string, `pos`: object, `filename`: string): *`EdgeError`*

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

Name | Type |
------ | ------ |
`chars` | string |
`pos` | object |
`filename` | string |

**Returns:** *`EdgeError`*

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

▸ **getTag**(`content`: string, `line`: number, `col`: number, `tags`: [Tags](lexer.md#tags)): *[RuntimeTag](lexer.md#runtimetag) | null*

Returns runtime tag node if tag is detected and is a registered tag

**Parameters:**

Name | Type |
------ | ------ |
`content` | string |
`line` | number |
`col` | number |
`tags` | [Tags](lexer.md#tags) |

**Returns:** *[RuntimeTag](lexer.md#runtimetag) | null*

___

###  unclosedCurlyBrace

▸ **unclosedCurlyBrace**(`pos`: object, `filename`: string): *`EdgeError`*

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

Name | Type |
------ | ------ |
`pos` | object |
`filename` | string |

**Returns:** *`EdgeError`*

___

###  unclosedParen

▸ **unclosedParen**(`pos`: object, `filename`: string): *`EdgeError`*

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

Name | Type |
------ | ------ |
`pos` | object |
`filename` | string |

**Returns:** *`EdgeError`*

___

###  unclosedTag

▸ **unclosedTag**(`tag`: string, `pos`: object, `filename`: string): *`EdgeError`*

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

Name | Type |
------ | ------ |
`tag` | string |
`pos` | object |
`filename` | string |

**Returns:** *`EdgeError`*

___

###  unopenedParen

▸ **unopenedParen**(`pos`: object, `filename`: string): *`EdgeError`*

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

Name | Type |
------ | ------ |
`pos` | object |
`filename` | string |

**Returns:** *`EdgeError`*