[edge-lexer](../README.md) › ["Detector/index"](_detector_index_.md)

# Module: "Detector/index"

## Index

### Functions

* [getMustache](_detector_index_.md#getmustache)
* [getTag](_detector_index_.md#gettag)

## Functions

###  getMustache

▸ **getMustache**(`content`: string, `filename`: string, `line`: number, `col`: number): *[RuntimeMustache](_contracts_index_.md#runtimemustache) | [RuntimeComment](_contracts_index_.md#runtimecomment) | null*

Returns the runtime mustache node if mustache is detected. It will look for 3 types of
mustache statements.

- Comments `{{-- --}}`
- Safe Mustache `{{{ }}}`
- Escaped Mustache `@{{}}`

**Parameters:**

Name | Type |
------ | ------ |
`content` | string |
`filename` | string |
`line` | number |
`col` | number |

**Returns:** *[RuntimeMustache](_contracts_index_.md#runtimemustache) | [RuntimeComment](_contracts_index_.md#runtimecomment) | null*

___

###  getTag

▸ **getTag**(`content`: string, `filename`: string, `line`: number, `col`: number, `tags`: [Tags](../interfaces/_contracts_index_.tags.md)): *[RuntimeTag](_contracts_index_.md#runtimetag) | null*

Returns runtime tag node if tag is detected and is a registered tag

**Parameters:**

Name | Type |
------ | ------ |
`content` | string |
`filename` | string |
`line` | number |
`col` | number |
`tags` | [Tags](../interfaces/_contracts_index_.tags.md) |

**Returns:** *[RuntimeTag](_contracts_index_.md#runtimetag) | null*
