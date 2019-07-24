# E_UNOPENED_PAREN

This exception is raised when Javascript expression for tags is not wrapped inside opening and closing braces.

#### Invalid
```edge
@if auth.user
@endif
```

Following is the valid expression

#### Valid

```edge
@if(auth.user)
@endif
```
