# Edge lexer

Edge lexer detects tags from any markup language and converts them into tokens. Later these tokens can be used with a Javascript parser like `esprima` or `babylon` to complete a logical template engine ( this is what [edge-parser](https://github.com/poppinss/edge-parser) does).

This guide is an outline of the lexer.

---

## Note
The code used in examples is only subject to work, when using Edge template engine. The lexer job is to tokenize the whitelisted syntax.

The real functionality is added by the template engine by using the tokens created from this package 

---

## Features
1. Allows multiline expressions.
2. Whitespaces and newlines are retained.
3. Works with any markup or plain text files.
4. Syntax is close to Javascript.

## Terms used
This guide makes use of the following terms to identify core pieces of the tokenizer.

| Term | Node Type | Description |
|------|-----------|------------ |
| Tag | block | Tags are used to define logical blocks in the template engine. For example `if tag` or `include tag`. |
| Mustache | mustache | Javascript expression wrapped around curly braces. `{{ }}` |
| Raw | raw | A raw string, which has no meaning for the template engine |
| NewLine | newline | Newline |

## Nodes
Following is the list of Nodes returned by the tokenizer.

#### Block Node

```js
{
  type: 'block'
  lineno: number,
  properties: Prop,
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

`Block Node` is the only node, which contains recursive child nodes.

| Key | Value | Description |
|-----|------|-------------------|
| type | string | The type of node determines the behavior of node |
| lineno | number | The lineno in the source file
| properties | Prop | Meta data for the node. See [Properties](#properties) to more info.
| value | string | If node is a raw node, then value is the string in the source file
| children | array | Array of recursive nodes.

## Properties
The properties `Prop` is used to define meta data for a given Node. Nodes like `raw` and `newline`, doesn't need any metadata. 

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

## Example
Before reading more about the syntax and their output, let's check the following example.

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
      "raw": "if(username)"
    },
    "lineno": 1,
    "children": [
      {
        "type": "newline",
        "lineno": 1
      },
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
  },
  {
    "type": "newline",
    "lineno": 3
  }
]
```

## Supported Syntax

To make Edge an enjoyable template engine, we have kept the syntax very close the original Javascript syntax.

The following expressions are allowed.

## Tags (block)

1. Every block level tag starts with `@` symbol followed by the tagName.
2. It is important to close a block level using `@end<tagName>`
3. `@` and `tagName` cannot have spaces between them.

**VALID**

```
@if(username)
@endif
```

**VALID**

```
@if(
  username
)
@endif
```

**VALID**

```
@if(
  (
    2 + 2
  )
  ===
  4
)
```

**VALID**

```
@if
(
 username
)
```

**INVALID**

The opening of the tag must be in it's own line and so do the closing one

```
@if(username) Hello @endif
```

**INVALID**

```
@if(
  username
) <p> Hello </p>
@endif
```

## Tags (inline)
The inline tags doesn't contain any childs and hence requires no `@end` statement.

**VALID**

```
@include('header')
```

**VALID**

```
@include(
  'header'
)
```

**VALID**

```
@include
(
  'header'
)
```

## Tags (block-self closed)

At times block level tags can work fine without any body inside them. To keep the syntax concise, you can **self-close** a block level tag.

**NORMAL**

```
@component('title')
  <h1> Hello world </h1>
@endcomponent
```

**SELF CLOSED**

```
@!component('title', title = '<h1> Hello world </h1>')
```

## Mustache
The mustache braces `{{` are used to define inline Javascript expressions. The lexer allows

1. Multiline expressions.
2. A valid Javascript expression, that yields to a value.
3. The HTML output from mustache will be escaped, so make sure to use `{{{ '<p>' Hello world </p> }}}` for rendering HTML nodes.

**VALID**

```
{{ username }}
```

**VALID**

```
{{
 username
}}
```

**VALID**

```
Your friends are {{
  users.map((user) => {
    return user.username
  }).join(',')
}}
```

**VALID**

```
{{{ '<p>' Hello world </p> }}}
```

**INVALID**

The starting curly brace, must be in one line.

```
{
{
  username
}
}
```

## Escaping

The backslash `\` has a special meaning in Javascript, that's why we make use of `@` to escape Edge statements.

> There is no need to escape the `@end` statements, since they are tightly mapped with the start statements. So if a start statement doesn't exists, the end statement will be considered as a raw node.

**ESCAPED**

```
@@if(username)
@endif
```

yields

```json
[
  {
    "type": "raw",
    "value": "@if(username)",
    "lineno": 1
  },
  {
    "type": "newline",
    "lineno": 1
  },
  {
    "type": "raw",
    "value": "@endif",
    "lineno": 2
  },
  {
    "type": "newline",
    "lineno": 2
  }
]
```

In the same fashion, the mustache braces can be escaped using `@`.

**ESCAPED**

```
Hello @{{ username }}
```
