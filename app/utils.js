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
    return slice.call(list);
  }

  function unescape (str) {
    return str.replace(CHAR_ENTITY, function (whole, number) {
      return String.fromCharCode(+number);
    });
  }
});
