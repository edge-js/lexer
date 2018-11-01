# E_CANNOT_SEEK_STATEMENT

This exception is raised when you are write raw text in the same line as the tag.


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


The following is a valid expression


#### Valid
```edge
@if(username === 'virk')
  Hello {{ username }}
@endif
```
