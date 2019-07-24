# E_UNCLOSED_PAREN

This exception is raised when the number of `opened` and `closed` parentheses *( )* mis-matches

#### Invalid
```edge
@if((2 + 2) * (3)
```

Following are the valid expressions

#### Valid

```edge
@if((2 + 2) * (3))
```

or expand to multiple lines for clarity

```edge
@if(
  (2 + 2) * (3)
)
```
