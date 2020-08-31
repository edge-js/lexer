# E_CANNOT_SEEK_STATEMENT

This exception is raised when you write raw text in the same line as the tag.

#### Invalid

```edge
@if(username === 'virk') Hello {{ username }} @endif
```

#### Invalid

```edge
@if(username === 'virk') Hello
  {{ username }}
@endif
```

Following is a valid expression

#### Valid

```edge
@if(username === 'virk')
  Hello {{ username }}
@endif
```
