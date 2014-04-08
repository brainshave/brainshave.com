"use strict";

var mds_w_headers = require("./lib/mds_w_headers");
var indexes = require("./lib/indexes");
var beauty = require("./lib/beauty");

var stencil = require("broccoli-stencil");
var less = require("broccoli-less");
var concat = require("broccoli-concat");
var merge = require("broccoli-merge-trees");
var copy = require("broccoli-static-compiler");

module.exports = function (broccoli) {
  // Add headers to md files
  var input_pages_w_headers = mds_w_headers("pages");

  var input_pages = merge([
    input_pages_w_headers,
    // Create indexes for folders (like "blog" and "talks")
    indexes(input_pages_w_headers, { template: "list" })
  ]);

  // Allow to use pages as partials
  var partials = merge([
    "partials",
    input_pages
  ]);

  var pages = beauty(stencil({
    pages:     input_pages,
    partials:  partials,
    templates: "templates"
  }));

  var images = copy("pages", {
    srcDir: "/", destDir: "/",
    files: ["**/*.png", "**/*.jpg", "**/*.svg"]
  });

  var css = concat(less("styles", {
    paths: "./styles"
  }), {
    inputFiles: ["*.css"],
    outputFile: "/all.css"
  });

  var js = concat("app", {
    // Make sure ns.js is first
    inputFiles: ["ns.js", "*.js"],
    outputFile: "/all.js"
  });

  return merge([css, js, pages, images]);
};
