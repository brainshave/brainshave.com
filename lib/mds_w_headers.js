"use strict";

// All Markdown files are plain, without meta data. They're parsed,
// the title is the first "#", the date is the first YYYY-MM-DD. The
// template is taken from path name

var dirname = require("path").dirname;

var Filter  = require("broccoli-filter");

var meta = require("./meta");

module.exports = MDsWHeadersFilter;

MDsWHeadersFilter.prototype = new Filter();
MDsWHeadersFilter.prototype.processString   = parse;
MDsWHeadersFilter.prototype.extensions      = ["md"];
MDsWHeadersFilter.prototype.targetExtension =  "md";

function MDsWHeadersFilter (tree, options) {
  // OOo… :-(
  if (!(this instanceof MDsWHeadersFilter)) {
    return new MDsWHeadersFilter(tree, options);
  }

  Filter.call(this, tree, options);
}

function parse (source, path) {
  var header = JSON.stringify({
    title: meta.title(source),
    date:  meta.date(source),
    template: dirname(path)
  });

  return header + "\n\n" + source;
}
