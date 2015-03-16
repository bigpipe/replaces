# replaces

[![From bigpipe.io][from]](http://bigpipe.io)[![Version npm][version]](http://browsenpm.org/package/replaces)[![Build Status][build]](https://travis-ci.org/bigpipe/replaces)[![Dependencies][david]](https://david-dm.org/bigpipe/replaces)[![Coverage Status][cover]](https://coveralls.io/r/bigpipe/replaces?branch=master)

[from]: https://img.shields.io/badge/from-bigpipe.io-9d8dff.svg?style=flat-square
[version]: http://img.shields.io/npm/v/replaces.svg?style=flat-square
[build]: http://img.shields.io/travis/bigpipe/replaces/master.svg?style=flat-square
[david]: https://img.shields.io/david/bigpipe/replaces.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/bigpipe/replaces/master.svg?style=flat-square

Replaces is a micro library that moves the data formatting instructions to the
template placeholders using special modifier chars.

## Installation

This module should work server-side and client side using the commonjs module
system. The module it self is released in the public npm registry and can be
installed by running:

```
npm install --save replaces
```

## Usage

The module only exposes one single interface, which is a function that requires
3 arguments:

1. The template string that contains the tags that should be replaced.
2. A Regular Expression that has 2 capturing groups:
  1. First group should capture the data modifier which can be `\W+`
  2. The second group is the name of the key that should be used to extract the
     data from the supplied data argument.
3. The data object which contains all the information.

```js
'use strict';

var replaces = require('replaces')
  , template = require('fs').readFileSync(__dirname +'/template.html', 'utf-8');

console.log(replaces(template, /{fittings(\W+)([^}]+?)}/g, {
  data: 'structure',
  deeply: {
    nested: {
      data: 'structures'
    }
  }
}));
```

Where `template.html` would be:

```html
<div>{fittings:deeply.nested.data}</div>
<div>{fittings@deeply}</div>
```

Would produce the following output in the console.

```
<div></div>
<div>{"nested":{"data":"structures"}}</div>
```

### Modifiers

The template tags can use various of modifiers. 

- **`<>`** Make sure that the data we're trying to add to the template is save
  to use inside of HTML tags.
- **`~`** Transform the receiving data in to a JSON.stringify structure.
- **`@`** Transform the receiving data in to a JSON.stringify structure
  **without** crashing on circular references like a normal stringify operation
  would.
- **`$`** Transform the data using the circular JSON parser and ensure that
  every value inside the JSON is encoded using the `<>` modifier.
- **`%`** Escape the data using the `escape` function.
- Any other non `\W` is just ignored and will indicated that the data should
  just be pasted in as normal.

New modifier can easily be added by adding new properties to the
`replaces.modifiers` object. The `key` of the object should the be modifier it's
triggered by and the value should be a function that transforms the data. The
transformer function receives 2 arguments:

1. The key that was used to retrieve the data
2. Data the key will be replaced with.

The function should **always** return a string.

## License

MIT
