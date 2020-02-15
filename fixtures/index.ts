import dedent from 'dedent'

export const fixtures: { name: string, in: string, out: any }[] = [
  {
    name: 'block tag',
    in: dedent`@if(username)
@endif`,
    out: [
      {
        type: 'tag',
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 1,
            col: 13,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'multiline opening tag statement',
    in: dedent`@if(
  username
)
@endif`,
    out: [
      {
        type: 'tag',
        properties: {
          name: 'if',
          jsArg: '\nusername\n',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 4,
          },
          end: {
            line: 3,
            col: 1,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'inline tag',
    in: dedent`@include('header')`,
    out: [
      {
        type: 'tag',
        properties: {
          name: 'include',
          jsArg: '\'header\'',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 1,
            col: 18,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'multiline inline tag',
    in: dedent`@include(
  'header'
)`,
    out: [
      {
        type: 'tag',
        properties: {
          name: 'include',
          jsArg: '\n\'header\'\n',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 9,
          },
          end: {
            line: 3,
            col: 1,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'selfclosed tag',
    in: dedent`@!if(username)`,
    out: [
      {
        type: 'tag',
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: true,
        },
        loc: {
          start: {
            line: 1,
            col: 5,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'escaped tag',
    in: dedent`@@if(username)
    @endif`,
    out: [
      {
        type: 'e__tag',
        properties: {
          name: 'if',
          jsArg: 'username',
          selfclosed: false,
        },
        loc: {
          start: {
            line: 1,
            col: 5,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
        children: [],
      },
    ],
  },
  {
    name: 'mustache',
    in: dedent`{{ username }}`,
    out: [
      {
        type: 'mustache',
        properties: {
          jsArg: ' username ',
        },
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 1,
            col: 14,
          },
        },
      },
    ],
  },
  {
    name: 'multiline mustache',
    in: dedent`{{
username
}}`,
    out: [
      {
        type: 'mustache',
        properties: {
          jsArg: '\nusername\n',
        },
        loc: {
          start: {
            line: 1,
            col: 2,
          },
          end: {
            line: 3,
            col: 2,
          },
        },
      },
    ],
  },
  {
    name: 'complex multiline mustache',
    in: dedent`Your friends are {{
  users.map((user) => {
    return user.username
  }).join(',')
}}`,
    out: [
      {
        type: 'raw',
        value: 'Your friends are ',
        line: 1,
      },
      {
        type: 'mustache',
        properties: {
          jsArg: '\nusers.map((user) => {\n  return user.username\n}).join(\',\')\n',
        },
        loc: {
          start: {
            line: 1,
            col: 19,
          },
          end: {
            line: 5,
            col: 2,
          },
        },
      },
    ],
  },
  {
    name: 'escaped mustache',
    in: dedent`@{{ username }}`,
    out: [
      {
        type: 'e__mustache',
        properties: {
          jsArg: ' username ',
        },
        loc: {
          start: {
            line: 1,
            col: 3,
          },
          end: {
            line: 1,
            col: 15,
          },
        },
      },
    ],
  },
]
