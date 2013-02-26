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

ns.show = function (target) {
  if (typeof target === 'string') {
    target = ns(target);
  }

  for (var i = 1; i < arguments.length; ++i) {
    var fn = arguments[i];
    target[fn.name] = fn;
  }
};
