**[edge-lexer](../README.md)**

> [Globals](../README.md) / [src/Scanner](../modules/src_scanner.md) / Scanner

# Class: Scanner

Scan a string and seperate it into 2 pairs. The first pair will be series
of characters until the ending pattern is found and 2nd pair is the
left over.

Their are some special behaviors over the regular `string.split` method.

1. Multiple lines can be passed by calling `scan` method for each line.
2. Tolerates characters when they conflict with the ending pattern.

```js
const pattern = ')'
const tolerations = ['(', ')']
const scanner = new Scanner(pattern, tolerations)

scanner.scan('2 + 2 * (3))')
if (scanner.closed) {
  scanner.match // 2 + 2 * (3)
  scanner.leftOver // ''
}
```

If we take the same string `2 + 2 * (3))` and split it using ')', then we
will get unexpected result, since the split method splits by finding the
first match.

## Hierarchy

* **Scanner**

## Index

### Constructors

* [constructor](src_scanner.scanner.md#constructor)

### Properties

* [closed](src_scanner.scanner.md#closed)
* [leftOver](src_scanner.scanner.md#leftover)
* [match](src_scanner.scanner.md#match)

### Methods

* [scan](src_scanner.scanner.md#scan)

### Object literals

* [loc](src_scanner.scanner.md#loc)

## Constructors

### constructor

\+ **new Scanner**(`pattern`: string, `toleratePair`: [string, string], `line`: number, `col`: number): [Scanner](src_scanner.scanner.md)

#### Parameters:

Name | Type |
------ | ------ |
`pattern` | string |
`toleratePair` | [string, string] |
`line` | number |
`col` | number |

**Returns:** [Scanner](src_scanner.scanner.md)

## Properties

### closed

•  **closed**: boolean = false

Tracking if the scanner has been closed

___

### leftOver

•  **leftOver**: string = ""

The content in the same line but after the closing
of the pattern

___

### match

•  **match**: string = ""

The matched content within the pattern

## Methods

### scan

▸ **scan**(`chunk`: string): void

Scan a string and look for the closing pattern. The string will
be seperated with the closing pattern and also tracks the
toleration patterns to make sure they are not making the
scanner to end due to pattern mis-match.

#### Parameters:

Name | Type |
------ | ------ |
`chunk` | string |

**Returns:** void

## Object literals

### loc

▪  **loc**: object

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`col` | number | this.col |
`line` | number | this.line |
