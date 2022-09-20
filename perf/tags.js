const Tokenizer = require('../build/src/tokenizer').Tokenizer
const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const template = `
This is a dummy template string to run some performance checks against
the tokenizer and see if there is room for improvements or not?

Here we will focus on tags only

@if(username)
  @each(user in users)
    @if(user.age)
      {{ user.age }}
    @endif
  @endeach
@endif
`

suite
  .add('Tokenizer tags', function () {
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
