// @ts-check

const Tokenizer = require('..')
const dedent = require('dedent')

const exampleCode = dedent`
@if(username)
  <h2> Hello {{ username }} </h2>
@endif
`
const tagsDef = {
  if: {
    block: true,
    seekable: true,
    selfclosed: false
  }
}

const tokenizer = new Tokenizer(exampleCode, tagsDef)
tokenizer.parse()

console.log(JSON.stringify(tokenizer['tokens'], null, 2))
