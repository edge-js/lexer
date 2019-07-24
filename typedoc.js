module.exports = require('@adonisjs/mrm-preset/_typedoc.js')({
  exclude: [
    '**/test/*.ts',
    'index.ts',
    '**/fixtures/*.ts',
  ],
  readme: 'none',
})
