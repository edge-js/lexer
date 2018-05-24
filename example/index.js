// @ts-check

const Tokenizer = require('..')
const dedent = require('dedent')

const exampleCode = dedent`
@if(username)
@endif
`
const tagsDef = {
  if: {
    block: true,
    seekable: true
  }
}

const tokenizer = new Tokenizer(exampleCode, tagsDef)
tokenizer.parse()

console.log(JSON.stringify(tokenizer['tokens'], null, 2))
