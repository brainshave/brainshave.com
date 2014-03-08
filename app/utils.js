ns('szywon.utils', function () {
  'use strict';

  this.children = children;
  this.array    = array;
  this.unescape = unescape;

  var CHAR_ENTITY = /&#(\d+);/g;

  var slice = Array.prototype.slice;

  function children (container) {
    return slice.call(container.children);
  }

  function array (list) {
    var result = [];
    for (var i = 0; i < list.length; ++i) {
      result[i] = list[i];
    }
    return result;
  }

  function unescape (str) {
    return str.replace(CHAR_ENTITY, function (whole, number) {
      return String.fromCharCode(+number);
    });
  }
});
