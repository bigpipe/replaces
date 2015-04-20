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

  it('can find data on prop, even if it uses dot notation', function () {
    var yes = 'yes {test:deep.nesting.yes}'
      , data = { 'deep.nesting.yes': true };

    assume(replaces(yes, re, data)).equals('yes true');
  });

  it('can return data from an nested array', function () {
    var no = 'no {test:deep.nesting.1.what}'
      , yes = 'yes {test:deep.nesting.0.what}'
      , data = { deep: { nesting: [ { what: 'yes' }, { what: 'nope' } ]} };

    assume(replaces(yes, re, data)).equals('yes yes');
    assume(replaces(no, re, data)).equals('no nope');
  });

  it('the found data is `toString()`d', function () {
    var tpl = 'hello {test:data}'
      , data = { data: { toString: function () { return 'world'; }}};

    assume(replaces(tpl, re, data)).equals('hello world');
  });

  describe('modifiers', function () {
    describe('<>', function () {
      it('escapes the output as HTML', function () {
        var tpl = '{test<>html}, {test:html}'
          , data = { html: '<div>' };

        assume(replaces(tpl, re, data)).equals('&lt;div&gt;, <div>');
      });

      it('does not escape or break slashes', function () {
        var tpl = '{test<>html}, {test:html}'
          , data = { html: '/3846c91f105fc08b0b5993c7045c314553f28052.js' };

        assume(replaces(tpl, re, data)).equals(data.html +', '+ data.html);
      });
    });

    describe('~', function () {
      it('escapes the output as JSON', function () {
        var tpl = '{test~data}, {test:data}'
          , data = { data: { structure: 'hi' } };

        assume(replaces(tpl, re, data)).equals('{"structure":"hi"}, [object Object]');
      });
    });

    describe('%', function () {
      it('escapes the output', function () {
        var tpl = '{test%data}, {test:data}'
          , data = { data: 'hello world' };

        assume(replaces(tpl, re, data)).equals('hello%20world, hello world');
      });
    });

    describe('@', function () {
      it('escapes circular references', function () {
        var data = { foo: 'bar', data: { foo: 'foo' } }
          , tpl = '{test@data}, {test:data}';

        data.data.data = data.data;

        assume(replaces(tpl, re, data)).equals('{"foo":"foo","data":"[Circular ~]"}, [object Object]');
      });
    });

    describe('$', function () {
      it('escapes circular references', function () {
        var data = { foo: 'bar', data: { foo: '<div class="woop">hi</div>' } }
          , tpl = '{test$data}, {test:data}';

        data.data.data = data.data;
        assume(replaces(tpl, re, data)).equals('{"foo":"&lt;div class=&quot;woop&quot;&gt;hi&lt;/div&gt;","data":"[Circular ~]"}, [object Object]');
      });

      it('escapes HTML inside the JSON', function () {
        var tpl = '{test$data}, {test:data}'
          , data = { data: { structure: '<div class="woop">hi</div>' } };

        assume(replaces(tpl, re, data)).equals('{"structure":"&lt;div class=&quot;woop&quot;&gt;hi&lt;/div&gt;"}, [object Object]');
      });
    });
  });
});
