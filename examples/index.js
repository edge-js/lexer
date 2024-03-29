import dedent from 'dedent'
import { Tokenizer } from '../build/index.js'

const exampleCode = dedent`
{{-- Show username when exists --}}
@if(username)
  {{-- Wrap inside h2 --}}
  <h2> Hello {{ username }} </h2>
@endif
`
const tagsDef = {
  if: {
    block: true,
    seekable: true,
  },
}

const tokenizer = new Tokenizer(exampleCode, tagsDef, { filename: 'eval.edge' })
tokenizer.parse()

console.log(JSON.stringify(tokenizer['tokens'], null, 2))
