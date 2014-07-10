"use strict";

var filter = require("broccoli-dep-filter");

module.exports = copy;

var FILES_ONLY = /[^\/]$/;

function copy (trees, options) {
  options = options || {};

  return filter({
    trees: trees,
    filter: options.filter || FILES_ONLY,
    dest_dir: options.dest_dir,
    extensions: options.extensions,
    binary: true,
    process: pass,
    name: "Copy"
  });
}

function pass (source) {
  return source;
}
