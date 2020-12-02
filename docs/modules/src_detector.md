**[edge-lexer](../README.md)**

> [Globals](../README.md) / src/Detector

# Module: src/Detector

## Index

### Functions

* [getMustache](src_detector.md#getmustache)
* [getTag](src_detector.md#gettag)

## Functions

### getMustache

▸ **getMustache**(`content`: string, `filename`: string, `line`: number, `col`: number): [RuntimeMustache](src_contracts.md#runtimemustache) \| [RuntimeComment](src_contracts.md#runtimecomment) \| null

Returns the runtime mustache node if mustache is detected. It will look for 3 types of
mustache statements.

- Comments `{{-- --}}`
- Safe Mustache `{{{ }}}`
- Escaped Mustache `@{{}}`

#### Parameters:

Name | Type |
------ | ------ |
`content` | string |
`filename` | string |
`line` | number |
`col` | number |

**Returns:** [RuntimeMustache](src_contracts.md#runtimemustache) \| [RuntimeComment](src_contracts.md#runtimecomment) \| null

___

### getTag

▸ **getTag**(`content`: string, `filename`: string, `line`: number, `col`: number, `tags`: [Tags](../interfaces/src_contracts.tags.md), `claimTag?`: undefined \| (name: string) => [LexerTagDefinitionContract](../interfaces/src_contracts.lexertagdefinitioncontract.md) \| null): [RuntimeTag](src_contracts.md#runtimetag) \| null

Returns runtime tag node if tag is detected and is a registered tag

#### Parameters:

Name | Type |
------ | ------ |
`content` | string |
`filename` | string |
`line` | number |
`col` | number |
`tags` | [Tags](../interfaces/src_contracts.tags.md) |
`claimTag?` | undefined \| (name: string) => [LexerTagDefinitionContract](../interfaces/src_contracts.lexertagdefinitioncontract.md) \| null |

**Returns:** [RuntimeTag](src_contracts.md#runtimetag) \| null
