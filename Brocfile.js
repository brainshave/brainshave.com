"use strict";

var mds_w_headers = require("./lib/mds_w_headers");
var indexes = require("./lib/indexes");
var beauty = require("./lib/beauty");
var atom = require("./lib/atom");
var merge = require("./lib/copy");

var stencil = require("broccoli-stencil");
var less = require("broccoli-more");
var concat = require("broccoli-concat");

var input_pages_w_headers = mds_w_headers("pages");
var indexes = indexes(input_pages_w_headers, { template: "list" });

var root_pages = merge(["pages"], {
  filter: function (path) {
    return /^[^\/]+$/.test(path);
  }
});

var input_pages = merge([root_pages, indexes, input_pages_w_headers]);

// Allow to use pages as partials
var partials = merge([
  "partials",
  input_pages
]);

var pages = beauty([stencil({
  pages:     input_pages,
  partials:  partials,
  templates: "templates"
})]);


var atoms = atom({ indexes: indexes, pages: pages });

var images = merge(["pages"], {
  extensions: ["png", "jpg", "svg"]
});

var icons = merge(["icons"], {
  dest_dir: "icons",
  extensions: ["gif", "ico"]
});

var demos = merge(["demo"], {
  dest_dir: "demo"
});

var cname = merge(["resources"], {
  filter: /^CNAME$/
});

var css = concat(less("styles", {
  paths: ["./styles"]
}), {
  inputFiles: ["*.css"],
  outputFile: "/all.css"
});

var js = concat("app", {
  // Make sure ns.js is first
  inputFiles: ["ns.js", "*.js"],
  outputFile: "/all.js"
});

module.exports = merge([css, js, pages, atoms,
                        images, icons, cname, demos]);
