import { Tokenizer } from '../build/index.js'
import Benchmark from 'benchmark'

const { Suite } = Benchmark
const suite = new Suite()

const template = `
This is a dummy template string to run some performance checks against
the tokenizer and see if there is room for improvements or not?

Let's start with some {{ variables }} and some multiline operations {{
  users.map((user) => {
    return user.username
  }).join(',')
}}

What if we have some tags too?

@if(users.length)
  @each(user in users)
    <li> {{ user.username }} </li>
  @endeach
@endif
`

suite
  .add('Tokenizer', function () {
    const tokenizer = new Tokenizer(
      template,
      {
        if: {
          seekable: true,
          selfclosed: false,
          block: true,
        },
        each: {
          seekable: true,
          selfclosed: true,
          block: true,
        },
      },
      { filename: 'welcome.edge' }
    )
    tokenizer.parse()
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .run()
