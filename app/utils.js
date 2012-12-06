(function () {
  var CHAR_ENTITY = /&#(\d+);/;

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

  this.children = children;
  this.array    = array;
  this.unescape = unescape;

}).call(ns('szywon.utils'));
