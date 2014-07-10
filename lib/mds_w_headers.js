"use strict";

// All Markdown files are plain, without meta data. They're parsed,
// the title is the first "#", the date is the first YYYY-MM-DD. The
// template is taken from path name

var fs = require("fs");

var filter = require("broccoli-dep-filter");
var meta = require("./meta");

module.exports = mds_w_headers;

function mds_w_headers (input) {
  return filter({
    trees: [input],
    target: "md",
    extensions: ["md"],
    filter: sieve,
    read: false,
    process: process
  });
}

function sieve (path) {
  return /.*\/.*/.test(path);
}

function process (path) {
  var source = fs.readFileSync(path, "utf8");
  var header = JSON.stringify({
    title: meta.title(source),
    date:  meta.date(source),
    template: meta.template(path)
  });

  return header + "\n\n" + source;
}
