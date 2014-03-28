"use strict";

var mds_w_headers = require("./lib/mds_w_headers");

var stencil = require("broccoli-stencil");
var less = require("broccoli-less");
var concat = require("broccoli-concat");

module.exports = function (broccoli) {
  var pages_w_mds_w_headers = mds_w_headers(broccoli.makeTree("pages"));

  var pages = stencil({
    pages:     pages_w_mds_w_headers,
    templates: broccoli.makeTree("templates"),
    partials:  broccoli.makeTree("partials")
  });

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
