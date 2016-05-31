char-split
=================

Splits a string stream on a character (e.g. \\n) and emits the strings in between.

Install
-------

```
npm install char-split
```

Usage / Examples
----------------

```js
var split = require('char-split')

stream.pipe(
    split()
        .on('data', function(data) {
            // line of text
        })
        .on('end', function(data) {
            // end of stream
        })
        .on('error', function(error) {
            // error in stream
        })
)
```

Optional arguments:

```js
split(character = '\n')
```

Notes
-----

For simplicity, char-split doesn't support multi-character split strings. This means splitting on \r\n won't work.

License
-------
Open source software under the [zlib license](LICENSE).