(function () {
  ns.show(this, trim);

  var whitespace_both_sides = /^\s+|\s+$/mg;

  function trim (src) {
    return src.replace(whitespace_both_sides, '');
  }
}).call(ns('utils'));
