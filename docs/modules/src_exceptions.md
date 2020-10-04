**[edge-lexer](../README.md)**

> [Globals](../README.md) / src/Exceptions

# Module: src/Exceptions

## Index

### Functions

* [cannotSeekStatement](src_exceptions.md#cannotseekstatement)
* [unclosedCurlyBrace](src_exceptions.md#unclosedcurlybrace)
* [unclosedParen](src_exceptions.md#unclosedparen)
* [unclosedTag](src_exceptions.md#unclosedtag)
* [unopenedParen](src_exceptions.md#unopenedparen)

## Functions

### cannotSeekStatement

▸ **cannotSeekStatement**(`chars`: string, `pos`: { col: number ; line: number  }, `filename`: string): EdgeError

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

#### Parameters:

Name | Type |
------ | ------ |
`chars` | string |
`pos` | { col: number ; line: number  } |
`filename` | string |

**Returns:** EdgeError

___

### unclosedCurlyBrace

▸ **unclosedCurlyBrace**(`pos`: { col: number ; line: number  }, `filename`: string): EdgeError

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

#### Parameters:

Name | Type |
------ | ------ |
`pos` | { col: number ; line: number  } |
`filename` | string |

**Returns:** EdgeError

___

### unclosedParen

▸ **unclosedParen**(`pos`: { col: number ; line: number  }, `filename`: string): EdgeError

Raised when a tag opening body doesn't have a closing brace. For example:

Incorrect
```
@if(username
```

Correct
```
@if(username)
```

#### Parameters:

Name | Type |
------ | ------ |
`pos` | { col: number ; line: number  } |
`filename` | string |

**Returns:** EdgeError

___

### unclosedTag

▸ **unclosedTag**(`tag`: string, `pos`: { col: number ; line: number  }, `filename`: string): EdgeError

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

#### Parameters:

Name | Type |
------ | ------ |
`tag` | string |
`pos` | { col: number ; line: number  } |
`filename` | string |

**Returns:** EdgeError

___

### unopenedParen

▸ **unopenedParen**(`pos`: { col: number ; line: number  }, `filename`: string): EdgeError

Raised when a tag is used without an opening brace. For example:

Incorrect
```
@if username
```

Correct
```
@if(username)
```

#### Parameters:

Name | Type |
------ | ------ |
`pos` | { col: number ; line: number  } |
`filename` | string |

**Returns:** EdgeError
