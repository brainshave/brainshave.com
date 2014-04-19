ns('szywon.utils', function () {
  'use strict';

  this.array = array;

  function array (list) {
    var result = [];
    for (var i = 0; i < list.length; ++i) {
      result[i] = list[i];
    }
    return result;
  }
});
