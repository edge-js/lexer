# E_UNCLOSED_TAG

This exception is raised when a block level like `@if`, `@else` was opened but never closed.

#### Invalid
```edge
@each (user in users)
  <li> {{ user.username }} </li>
```

The following is a valid expression

#### Valid

```edge
@each (user in users)
  <li> {{ user.username }} </li>
@endeach
```
