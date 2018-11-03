# Edge lexer

> Generating high level tokens from Edge whitelisted markup

[![travis-image]][travis-url]
[![appveyor-image]][appveyor-url]
[![coveralls-image]][coveralls-url]
[![npm-image]][npm-url]
![](https://img.shields.io/badge/Uses-Typescript-294E80.svg?style=flat-square&colorA=ddd)

Edge lexer produces a list of `tokens` by scanning for [Edge whitelisted syntax](https://github.com/edge-js/syntax). 

This module is a blend of a `lexer` and an `AST generator`, since Edge doesn't need a pure [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) that scans for each character. Edge markup is written within other markup languages like **HTML** or **Markdown** and walking over each character is waste of resources.

Instead, this module starts with some REGEX patterns to detect the [Edge whitelisted syntax](https://github.com/edge-js/syntax) and then starts the lexical analysis within the detected markup.

---

## Performance

Following measures are taken to keep the analysis performant

1. Only analyse markup that is detected as Edge whitelisted syntax.
2. Only analyse `tags`, that are passed to the tokenizer. Which means even if the syntax for tags is whitelisted, the tokeniser will analyse them if they are used by your app.
3. Do not analyse Javascript expression and leave that for [edge-parser](https://github.com/edge-js/parser).


---

## Usage

```js
import { Tokenizer } from 'edge-lexer'

const template = `Hello {{ username }}`
const tags = {
  if: {
    block: true,
    selfclosed: false,
    seekable: true
  }
}

// Filename is required to add it to error messages
const options = {
  filename: 'welcome.edge'
}

const tokenizer = new Tokenizer(template, tags, options)

tokenizer.parse()
console.log(tokenizer.tokens)
```

---

## Features
1. Allows multiline expressions.
2. Whitespaces and newlines are retained.
3. Detects for unclosed tags.
4. Detects for unwrapped expressions and raises appropriate errors.

## Terms used
This guide makes use of the following terms to identify core pieces of the tokenizer.

| Term | Node Type | Description |
|------|-----------|------------ |
| Tag | block | Tags are used to define logical blocks in the template engine. For example `if tag` or `include tag`. |
| Mustache | mustache | Javascript expression wrapped in curly braces. `{{ }}` |
| Raw | raw | A raw string, which has no meaning for the template engine |
| NewLine | newline | Newline |
| Comment | comment | Edge specific comment block. This will be ripped off in the output.

---

## Nodes
Following is the list of Nodes returned by the tokenizer.

#### Block Node

```js
{
  type: 'block'
  lineno: number,
  properties: BlockProp,
  children: []
}
```

#### Raw Node

```js
{
  type: 'raw',
  lineno: number,
  value: string
}
```

#### Comment Node

```js
{
  type: 'comment',
  lineno: number,
  value: string
}
```

#### Mustache Node

```js
{
  type: 'mustache',
  lineno: number,
  properties: Prop
}
```

#### NewLine Node

```js
{
  type: 'newline',
  lineno: number
}
```


| Key | Value | Description |
|-----|------|-------------------|
| type | string | The type of node determines the behavior of node |
| lineno | number | The lineno in the source file
| properties | Prop | Meta data for the node. See [Properties](#properties) to more info.
| value | string | If node is a raw node, then value is the string in the source file
| children | array | Array of recursive nodes. Only exists, when `type === 'block'`.

---

## Properties
The properties `Prop` is used to define meta data for a given Node. Nodes like `raw`, `comment` and `newline`, doesn't need any metadata. 

#### BlockProp
The block prop is used by the `Block` node. The only difference from the regular `Prop` is the addition of `selfclosed` attribute.

```js
{
  name: string
  jsArg: string,
  raw: string,
  selfclosed: boolean
}
```

#### Prop

```js
{
  name: string
  jsArg: string,
  raw: string
}
```

| Key | Description |
|-------|------------|
| name | The name is the subtype for a given node. For example: `if` will be the name of the `@if` tag. |
| jsArg | The `jsArg` is the Javascript expression to evaluate |
| raw | The raw representation of a given expression. Used for debugging purposes. |
| selfclosed | Whether or not the tag was `selfclosed` during usage. |


---

## Mustache expressions

For mustache nodes props, the `name` is the type of mustache expressions. The lexer supports 4 mustache expressions.

**mustache**

```
{{ username }}
```

**e__mustache (Escaped mustache)**

The following expression is ignored by edge. Helpful when you want this expression to be parsed by a frontend template engine

```
@{{ username }}
```

**s__mustache (Safe mustache)**

The following expression output is considered HTML safe.

```
{{{ '<p> Hello world </p>' }}}
```

**es__mustache (Escaped safe mustache)**

```
@{{{ '<p> Not touched </p>' }}}
```

---

## Errors

Errors raised by the `lexer` are always an instance of [edge-error](https://github.com/edge-js/error) and will contain following properties.

```js
error.message
error.line
error.col
error.filename
error.code
```


---

## Example

```html
@if(username)
  <h2> Hello {{ username }} </h2>
@endif
```

The output of the above text will be

```js
[
  {
    "type": "block",
    "properties": {
      "name": "if",
      "jsArg": "username",
      "raw": "if(username)",
      "selfclosed": false
    },
    "lineno": 1,
    "children": [
      {
        "type": "raw",
        "value": "<h2> Hello ",
        "lineno": 2
      },
      {
        "type": "mustache",
        "lineno": 2,
        "properties": {
          "name": "mustache",
          "jsArg": " username ",
          "raw": "<h2> Hello {{ username }} </h2>"
        }
      },
      {
        "type": "raw",
        "value": " </h2>",
        "lineno": 2
      },
      {
        "type": "newline",
        "lineno": 2
      }
    ]
  }
]
```

## Change log

The change log can be found in the [CHANGELOG.md](CHANGELOG.md) file.

## Contributing

Everyone is welcome to contribute. Please go through the following guides, before getting started.

1. [Contributing](https://adonisjs.com/contributing)
2. [Code of conduct](https://adonisjs.com/code-of-conduct)


## Authors & License
[thetutlage](https://github.com/thetutlage) and [contributors](https://github.com/edge-js/lexer/graphs/contributors).

MIT License, see the included [MIT](LICENSE.md) file.

[travis-image]: https://img.shields.io/travis/edge-js/lexer/master.svg?style=flat-square&logo=travis
[travis-url]: https://travis-ci.org/edge-js/lexer "travis"

[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/lexer/master.svg?style=flat-square&logo=appveyor
[appveyor-url]: https://ci.appveyor.com/project/thetutlage/lexer "appveyor"

[coveralls-image]: https://img.shields.io/coveralls/edge-js/lexer/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/edge-js/lexer "coveralls"

[npm-image]: https://img.shields.io/npm/v/lexer.svg?style=flat-square&logo=npm
[npm-url]: https://npmjs.org/package/lexer "npm"
