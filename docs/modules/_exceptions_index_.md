[edge-lexer](../README.md) › ["Exceptions/index"](_exceptions_index_.md)

# Module: "Exceptions/index"

## Index

### Functions

* [cannotSeekStatement](_exceptions_index_.md#cannotseekstatement)
* [unclosedCurlyBrace](_exceptions_index_.md#unclosedcurlybrace)
* [unclosedParen](_exceptions_index_.md#unclosedparen)
* [unclosedTag](_exceptions_index_.md#unclosedtag)
* [unopenedParen](_exceptions_index_.md#unopenedparen)

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
