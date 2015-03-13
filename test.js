describe('replaces', function () {
  'use strict';

  var assume = require('assume')
    , replaces = require('./')
    , re = /{test(\W+)([^}]+?)}/g;

  it('is exported as function', function () {
    assume(replaces).is.a('function');
  });

  it('replaces multipe tags in a string', function () {
    var tpl = 'woop {test:tag} {test:tag}'
      , data = { tag: 'woop' };

    assume(replaces(tpl, re, data)).equals('woop woop woop');
  });

  it('looks up multiple values in a string', function () {
    var tpl = 'foo {test:bar} {test:baz}'
      , data = { baz: 'woop', bar: 'oi' };

    assume(replaces(tpl, re, data)).equals('foo oi woop');
  });

  it('can return deeply nested data', function () {
    var no = 'no {test:deep.nesting.no}'
      , yes = 'yes {test:deep.nesting.yes}'
      , data = { deep: { nesting: { yes: true, no: false }} };

    assume(replaces(yes, re, data)).equals('yes true');
    assume(replaces(no, re, data)).equals('no false');
  });
});
