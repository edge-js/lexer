**[edge-lexer](../README.md)**

> [Globals](../README.md) / src/utils

# Module: src/utils

## Index

### Functions

* [getLineAndColumn](src_utils.md#getlineandcolumn)
* [isEscapedMustache](src_utils.md#isescapedmustache)
* [isEscapedTag](src_utils.md#isescapedtag)
* [isMustache](src_utils.md#ismustache)
* [isSafeMustache](src_utils.md#issafemustache)
* [isTag](src_utils.md#istag)

## Functions

### getLineAndColumn

▸ **getLineAndColumn**(`token`: [Token](src_contracts.md#token)): [number, number]

Returns line and column number for a given lexer token

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |

**Returns:** [number, number]

___

### isEscapedMustache

▸ **isEscapedMustache**(`token`: [Token](src_contracts.md#token)): token is MustacheToken

Returns true when toke.type is an escaped mustache type

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |

**Returns:** token is MustacheToken

___

### isEscapedTag

▸ **isEscapedTag**(`token`: [Token](src_contracts.md#token), `name?`: undefined \| string): token is TagToken

Returns true when token is an escape tag with a given name

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |
`name?` | undefined \| string |

**Returns:** token is TagToken

___

### isMustache

▸ **isMustache**(`token`: [Token](src_contracts.md#token)): token is MustacheToken

Returns true when token.type is a mustache type

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |

**Returns:** token is MustacheToken

___

### isSafeMustache

▸ **isSafeMustache**(`token`: [Token](src_contracts.md#token)): token is MustacheToken

Returns true when token.type is a safe mustache type

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |

**Returns:** token is MustacheToken

___

### isTag

▸ **isTag**(`token`: [Token](src_contracts.md#token), `name?`: undefined \| string): token is TagToken

Returns true when token is a tag with a given name

#### Parameters:

Name | Type |
------ | ------ |
`token` | [Token](src_contracts.md#token) |
`name?` | undefined \| string |

**Returns:** token is TagToken
