**edge-lexer**

> [Globals](../README.md) / src/Contracts

# Module: src/Contracts

edge-lexer

(c) Harminder Virk <virk@adonisjs.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.

## Index

### Enumerations

* [MustacheTypes](../enums/src_contracts.mustachetypes.md)
* [TagTypes](../enums/src_contracts.tagtypes.md)

### Interfaces

* [LexerTagDefinitionContract](../interfaces/src_contracts.lexertagdefinitioncontract.md)
* [Tags](../interfaces/src_contracts.tags.md)

### Type aliases

* [CommentToken](src_contracts.md#commenttoken)
* [LexerLoc](src_contracts.md#lexerloc)
* [MustacheProps](src_contracts.md#mustacheprops)
* [MustacheToken](src_contracts.md#mustachetoken)
* [NewLineToken](src_contracts.md#newlinetoken)
* [RawToken](src_contracts.md#rawtoken)
* [RuntimeComment](src_contracts.md#runtimecomment)
* [RuntimeMustache](src_contracts.md#runtimemustache)
* [RuntimeTag](src_contracts.md#runtimetag)
* [TagProps](src_contracts.md#tagprops)
* [TagToken](src_contracts.md#tagtoken)
* [Token](src_contracts.md#token)

## Type aliases

### CommentToken

Ƭ  **CommentToken**: { filename: string ; loc: [LexerLoc](src_contracts.md#lexerloc) ; type: \"comment\" ; value: string  }

Comment token

#### Type declaration:

Name | Type |
------ | ------ |
`filename` | string |
`loc` | [LexerLoc](src_contracts.md#lexerloc) |
`type` | \"comment\" |
`value` | string |

___

### LexerLoc

Ƭ  **LexerLoc**: { end: { col: number ; line: number  } ; start: { col: number ; line: number  }  }

Location node for tags and mustache braces

#### Type declaration:

Name | Type |
------ | ------ |
`end` | { col: number ; line: number  } |
`start` | { col: number ; line: number  } |

___

### MustacheProps

Ƭ  **MustacheProps**: { jsArg: string  }

Properties for a mustache block

#### Type declaration:

Name | Type |
------ | ------ |
`jsArg` | string |

___

### MustacheToken

Ƭ  **MustacheToken**: { filename: string ; loc: [LexerLoc](src_contracts.md#lexerloc) ; properties: [MustacheProps](src_contracts.md#mustacheprops) ; type: [MustacheTypes](../enums/src_contracts.mustachetypes.md)  }

Mustache token

#### Type declaration:

Name | Type |
------ | ------ |
`filename` | string |
`loc` | [LexerLoc](src_contracts.md#lexerloc) |
`properties` | [MustacheProps](src_contracts.md#mustacheprops) |
`type` | [MustacheTypes](../enums/src_contracts.mustachetypes.md) |

___

### NewLineToken

Ƭ  **NewLineToken**: { filename: string ; line: number ; type: \"newline\"  }

New line token

#### Type declaration:

Name | Type |
------ | ------ |
`filename` | string |
`line` | number |
`type` | \"newline\" |

___

### RawToken

Ƭ  **RawToken**: { filename: string ; line: number ; type: \"raw\" ; value: string  }

Raw line token

#### Type declaration:

Name | Type |
------ | ------ |
`filename` | string |
`line` | number |
`type` | \"raw\" |
`value` | string |

___

### RuntimeComment

Ƭ  **RuntimeComment**: { col: number ; filename: string ; isComment: true ; line: number ; realCol: number  }

Runtime comment node to know the shape of the comment

#### Type declaration:

Name | Type |
------ | ------ |
`col` | number |
`filename` | string |
`isComment` | true |
`line` | number |
`realCol` | number |

___

### RuntimeMustache

Ƭ  **RuntimeMustache**: { col: number ; escaped: boolean ; filename: string ; isComment: false ; line: number ; realCol: number ; safe: boolean  }

Runtime mustache node to know the shape of the mustache

#### Type declaration:

Name | Type |
------ | ------ |
`col` | number |
`escaped` | boolean |
`filename` | string |
`isComment` | false |
`line` | number |
`realCol` | number |
`safe` | boolean |

___

### RuntimeTag

Ƭ  **RuntimeTag**: [LexerTagDefinitionContract](../interfaces/src_contracts.lexertagdefinitioncontract.md) & { col: number ; escaped: boolean ; filename: string ; hasBrace: boolean ; line: number ; name: string ; selfclosed: boolean  }

The runtime tag node to know the shape of a tag

___

### TagProps

Ƭ  **TagProps**: { jsArg: string ; name: string ; selfclosed: boolean  }

Properties node for a tag

#### Type declaration:

Name | Type |
------ | ------ |
`jsArg` | string |
`name` | string |
`selfclosed` | boolean |

___

### TagToken

Ƭ  **TagToken**: { children: [Token](src_contracts.md#token)[] ; filename: string ; loc: [LexerLoc](src_contracts.md#lexerloc) ; properties: [TagProps](src_contracts.md#tagprops) ; type: [TagTypes](../enums/src_contracts.tagtypes.md)  }

Tag token

#### Type declaration:

Name | Type |
------ | ------ |
`children` | [Token](src_contracts.md#token)[] |
`filename` | string |
`loc` | [LexerLoc](src_contracts.md#lexerloc) |
`properties` | [TagProps](src_contracts.md#tagprops) |
`type` | [TagTypes](../enums/src_contracts.tagtypes.md) |

___

### Token

Ƭ  **Token**: [RawToken](src_contracts.md#rawtoken) \| [NewLineToken](src_contracts.md#newlinetoken) \| [TagToken](src_contracts.md#tagtoken) \| [MustacheToken](src_contracts.md#mustachetoken) \| [CommentToken](src_contracts.md#commenttoken)
