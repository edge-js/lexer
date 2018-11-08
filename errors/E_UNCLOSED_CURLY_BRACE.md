# E_UNCLOSED_CURLY_BRACE

This exception is raised when the number of `opened` and `closed` mustache mis-matches.

#### Invalid
```edge
{{ 2 + 2 }
```

```edge
{{{ `<p>${username}</p>` }}
```


The following is a valid expression


#### Valid

```edge
{{ 2 + 2 }}
```

```edge
{{{ `<p>${username}</p>` }}}
```
