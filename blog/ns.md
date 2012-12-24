# Simple JavaScript Modules with Namespaces

Lublin, 2012-12-24.

While I am aware of [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) and I use [require.js](http://requirejs.org/) frequently, I wished for a much simpler system for simple projects that don't need as advanced system as that.
I mean projects where all files are concatenated in the end and the coupling between the modules is sparse.
Other possible reason is when the size of require.js outweighs the application code ;).

## Lesson From a Robot

Some time ago I was experimenting with [TypeScript](http://typescriptlang.org) and I looked at the code it generates for modules and it got me thinking that a system I wished for is doable with a little amount of extra code.
Here's a simple TypeScript example:

    module A.B.C {
      export function asdf () {}
    }

It's just a syntax sugar for a kind of an advanced form of the JavaScript Module pattern.
Here's what's generated:

    var A;
    (function (A) {
        (function (B) {
            (function (C) {
                function asdf() {}
                C.asdf = asdf;
            })(B.C || (B.C = {}));
            var C = B.C;
        })(A.B || (A.B = {}));
        var B = A.B;
    })(A || (A = {}));

It has some nice properties:

1. An object for each module is automatically created if one doesn't exist.
1. Modules can be nested to any number of levels.
1. Each module can be *re-entered* but each reentering part has its own private members.

But I have two issues with it:

1.  If a module is re-entered later, the whole ceremonial code for getting into a nested module is repeated.
    (Three times a function and a var declarations, three times a check if a module exists.)
    That's bad for minification and concatenation.
1.  It's generated and not what I would like to write in plain JavaScript by hand.

## Choosing the Pattern

I did some digging to get more perspective on the subject.
I found a [thorough post on namespacing by Angus Croll](http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/).
I recommend reading the whole thing.
tl;dr: He describes five different approaches to namespacing in plain JavaScript of which the three latter ones I would equally recommend.

While it's more a matter of a personal (or team's) preference rather than a principle, I've chosen to like the last one the most.
It boils down to treating the `this` passed to the module constructor as the object representing its public interface.
This object is then passed using `apply` or `call`.
Here's an example from that post:

    var myApp = {};
    (function() {
      var id = 0;
      this.next = function() {};
      this.reset = function() {};
    }).apply(myApp);

It has the simplicity that I needed but it doesn't mitigate the problem of the boilerplate code that is needed to create the objects holding the modules.

## Filling the Void

I've asked a friend what he thinks about the pattern and more importantly what he uses for namespacing.
He pointed me at the [`Ext.ns` function](http://docs.sencha.com/ext-js/4-1/#!/api/Ext-method-ns) which basically just ensures that all objects on a given path exist.

The neat thing about the `ns` function is that it returns the namespace object.
We can use this value to pass it to the `call` of a module constructor:

    (function () {
      function foo () {}
      function bar () {}
      this.bar = bar;
    }).call(ns('somewhat.deeply.nested.namespace'));

A simplified version of the `ns` function looks like this:

    function ns (path) {
      var names = path.split('.');

      var parent = window;
      var object, name;

      for (var i = 0; i < names.length; ++i) {
        name   = names[i];
        object = parent[name];

        if (!object) {
          object = parent[name] = {};
        }

        parent = object;
      }

      return object;
    }

## Final Notes

With this system I write my modules in a very specific way.
Modules are sparsely dependent which means that other modules are not referenced in the code initializing a given module.
Any cross-module references are realized in the exposed functions.
That means also no prototype inheritance between modules but in JS you can get pretty far on functional constructs alone.
This sparsity allows files to be included in any order (with the exceptions of the first one holding the `ns` function and the last one which finally initializes the application).

That's probably a too constrained model for some.
It's easy to extend it with a function (maybe named `use`) which would be an alias to `ns` that's really just a mark expressing a dependency for a static analyzer which would sort them in the right order before concatenation (or before generating an array of `script` tags in a html template when in the "developer" mode).
That would suffice to use other modules inside the module constructors.

The same friend also pointed out that even better would be spawning a simple rendition of an AMD loader that does only what I need.
That's a thought for the future I suppose if I ever need something between the system introduced in this post and AMD (basically something with dynamic loading and that's unlikely because I would probably go with full require.js).
