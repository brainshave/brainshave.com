ns('szywon.callbacks', function () {
  'use strict';

  this.register = register;
  this.reset    = reset;

  var old = {};

  function register (name, fn, retain) {
    if (!retain) {
      old[name] = window[name];
    }

    window[name] = fn;
  }

  function reset () {
    for (var name in old) {
      window[name] = old[name];
      delete old[name];
    }
  }
});
