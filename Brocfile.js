"use strict";

var mds_w_headers = require("./lib/mds_w_headers");
var indexes = require("./lib/indexes");
var beauty = require("./lib/beauty");
var atom = require("./lib/atom");

var stencil = require("broccoli-stencil");
var less = require("broccoli-less");
var concat = require("broccoli-concat");
var merge = require("broccoli-merge-trees");
var copy = require("broccoli-static-compiler");

var input_pages_w_headers = mds_w_headers("pages");
var indexes = indexes(input_pages_w_headers, { template: "list" });

var input_pages = merge([indexes, input_pages_w_headers]);

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

var atoms = atom({ indexes: indexes, pages: pages });

var images = copy("pages", {
  srcDir: "/", destDir: "/",
  files: ["**/*.png", "**/*.jpg", "**/*.svg"]
});

var icons = copy("icons", {
  srcDir: "/", destDir: "/icons",
  files: ["**/*.gif", "**/*.ico"]
});

var cname = copy("resources", {
  srcDir: "/", destDir: "/",
  files: ["CNAME"]
});

var css = concat(less("styles", {
  paths: "./styles"
}), {
  inputFiles: ["*.css"],
  outputFile: "/all.css"
});

var demos = copy("demo", {
  srcDir: "/", destDir: "/demo",
  files: ["**/*.*"]
});

var js = concat("app", {
  // Make sure ns.js is first
  inputFiles: ["ns.js", "*.js"],
  outputFile: "/all.js"
});

module.exports = merge([css, js, pages, atoms, images, icons, cname, demos]);
