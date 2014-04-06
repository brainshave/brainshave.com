"use strict";

var mds_w_headers = require("./lib/mds_w_headers");
var indexes = require("./lib/indexes");
var beauty = require("./lib/beauty");

var stencil = require("broccoli-stencil");
var less = require("broccoli-less");
var concat = require("broccoli-concat");

module.exports = function (broccoli) {
  // Add headers to md files
  var input_pages_w_headers = mds_w_headers(broccoli.makeTree("pages"));

  var input_pages = new broccoli.MergedTree([
    input_pages_w_headers,
    // Create indexes for folders (like "blog" and "talks")
    indexes(input_pages_w_headers, { template: "list" })
  ]);

  // Allow to use pages as partials
  var partials = new broccoli.MergedTree([
    broccoli.makeTree("partials"),
    input_pages
  ]);

  var pages = beauty(stencil({
    pages:     input_pages,
    partials:  partials,
    templates: broccoli.makeTree("templates")
  }));

  var css = concat(less(broccoli.makeTree("styles"), {
    paths: "./styles"
  }), {
    inputFiles: ["*.css"],
    outputFile: "/all.css"
  });

  var js = concat(broccoli.makeTree("app"), {
    // Make sure ns.js is first
    inputFiles: ["ns.js", "*.js"],
    outputFile: "/all.js"
  });

  return [css, js, pages];
};
