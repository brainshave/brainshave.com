ns('utils', function () {
  'use strict';

  this.fns(trim, statements, by_field);

  var whitespace_both_sides = /^\s+|\s+$/mg;

  function trim (src) {
    return src.replace(whitespace_both_sides, '');
  }

  function statements (src) {
    return src.split(/;|\n/).map(function (stmt) {
      return trim(stmt).split(/\s+/);
    });
  }

  function by_field (field, value) {
    return function (object) {
      return object[field] === value;
    };
  }
});
