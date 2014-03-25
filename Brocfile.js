"use strict";

var stencil = require("broccoli-stencil");
var less = require("broccoli-less");
var concat = require("broccoli-concat");

module.exports = function (broccoli) {
  var pages = stencil({
    pages:     broccoli.makeTree("pages"),
    templates: broccoli.makeTree("templates"),
    partials:  broccoli.makeTree("partials")
  });

  var css = concat(less(broccoli.makeTree("styles"), {
    paths: "./styles"
  }), {
    inputFiles: ["*.css"],
    outputFile: "/all.css"
  });

  return [css, pages];
};
