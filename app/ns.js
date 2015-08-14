/*

This is a very simple name-spacing stuff.
You implement a module with:

ns('your.module.path', function () {
  this.fns(a, b);

  this.some_other_stuff = 'asdfftw!';

  function a () {}
  function b () {}
  function a_private_function () {}
});

This will cause to object your.module.path have fields a, b and some_other_stuff.
Modules can be re-entered so different parts have separate private scopes.
(Try to use this property to minimize amount of stuff brought in to functions as
closures.)

*/

function ns (path, fn) {
  var object = typeof path === 'string' ? ns.create_path(path)
                                        : path;
  if (typeof fn === 'function') {
    fn.call(object);
  }

  return object;
}

ns.root = {};

ns.NS = function () {};

ns.NS.prototype.fns = function () {
  for (var i = 0; i < arguments.length; ++i) {
    var fn = arguments[i];
    var name = ns.function_name(fn);
    this[name] = fn;
  }
};

ns.function_name = function (fn) {
  return fn.name || fn.toString().match(/function\s+([^\s\(]+)/)[1];
};

ns.create_path = function (path) {
  var names = path.split('.');

  var parent = ns.root;
  var object, name;

  for (var i = 0; i < names.length; ++i) {
    name   = names[i];
    object = parent[name];
    if (!object) {
      object = parent[name] = new ns.NS;
    }

    parent = object;
  }

  return object;
};

/*

For lazy references to functions & objects (to get the object you need to
invoke the returned function anyway)

When compiled, calls to this should be translated to literal paths, with the
exception of circular dependencies

Also, keeps guard of passing proper `this` to the functions (their own
namespace)

*/
function use (path) {
  var last_dot_index = path.lastIndexOf('.');
  var parent_path = path.substring(0, last_dot_index);
  var name = path.substring(last_dot_index + 1);

  var parent, object, run;

  return function () {
    if (!object) {
      parent = ns(parent_path);
      object = parent[name];
      run    = typeof object === 'function';
    }

    if (run) {
      return object.apply(parent, Array.prototype.slice.call(arguments, 0));
    } else {
      return object;
    }
  }
}

function main (fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    setTimeout(fn, 0);
  };
}
