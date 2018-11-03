# E_UNWRAPPED_JS_EXPRESSION

This exception is raised when Javascript expression for tags is not wrapped inside opening and closing braces.

#### Invalid
```edge
@if auth.user
@endif
```

The following is a valid expression

#### Valid

```edge
@if(auth.user)
@endif
```
