[edge-lexer](../README.md) › ["utils/index"](_utils_index_.md)

# External module: "utils/index"

## Index

### Functions

* [getLineAndColumn](_utils_index_.md#getlineandcolumn)
* [isEscapedMustache](_utils_index_.md#isescapedmustache)
* [isEscapedTag](_utils_index_.md#isescapedtag)
* [isMustache](_utils_index_.md#ismustache)
* [isSafeMustache](_utils_index_.md#issafemustache)
* [isTag](_utils_index_.md#istag)

## Functions

###  getLineAndColumn

▸ **getLineAndColumn**(`token`: [Token](_contracts_index_.md#token)): *[number, number]*

Returns line and column number for a given lexer token

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |

**Returns:** *[number, number]*

___

###  isEscapedMustache

▸ **isEscapedMustache**(`token`: [Token](_contracts_index_.md#token)): *token is MustacheToken*

Returns true when toke.type is an escaped mustache type

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |

**Returns:** *token is MustacheToken*

___

###  isEscapedTag

▸ **isEscapedTag**(`token`: [Token](_contracts_index_.md#token), `name?`: undefined | string): *token is TagToken*

Returns true when token is an escape tag with a given name

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |
`name?` | undefined &#124; string |

**Returns:** *token is TagToken*

___

###  isMustache

▸ **isMustache**(`token`: [Token](_contracts_index_.md#token)): *token is MustacheToken*

Returns true when token.type is a mustache type

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |

**Returns:** *token is MustacheToken*

___

###  isSafeMustache

▸ **isSafeMustache**(`token`: [Token](_contracts_index_.md#token)): *token is MustacheToken*

Returns true when token.type is a safe mustache type

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |

**Returns:** *token is MustacheToken*

___

###  isTag

▸ **isTag**(`token`: [Token](_contracts_index_.md#token), `name?`: undefined | string): *token is TagToken*

Returns true when token is a tag with a given name

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](_contracts_index_.md#token) |
`name?` | undefined &#124; string |

**Returns:** *token is TagToken*
