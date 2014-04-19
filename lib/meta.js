var fs   = require('fs');
var path = require('path');
var _    = require('underscore');

module.exports = {
  title: title,
  date:  date
};

var title_matcher = /^\#\s*([^\#].*)/;

function title (source) {
  var match = source.match(title_matcher);
  return match && match[1];
}

var date_matcher = /\d{4}-\d{2}-\d{2}/;

function date (source) {
  var match = source.match(date_matcher);
  return match && new Date(match[0]);
}
