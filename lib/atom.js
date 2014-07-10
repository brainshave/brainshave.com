"use strict";

module.exports = atom;

var fs = require("fs");
var dirname = require("path").dirname;
var join = require("path").join;

var _ = require("underscore");
var map_series = require("promise-map-series");
var xml = require("xml");
var walk_sync = require("walk-sync");
var quick_temp = require("quick-temp");
var mkdirp = require("mkdirp");
var cheerio = require("cheerio");

var filter = require("broccoli-dep-filter");

function atom (trees) {
  return filter({
    trees: trees,
    iterated: ["indexes"],
    extensions: ["html"],
    target: "xml",
    filter: /index\.html$/,
    init: init,
    name: "Atom"
  });
}

function init (roots) {
  var indexes_root = roots.indexes;
  var pages_root = roots.pages;

  return process;

  function process (source) {
    var head = JSON.parse(source.split("\n\n", 1));

    var data = feed(head.title, head.files.slice(0, 10).map(entry.bind(null, pages_root)));
    var text = xml(data, { indent: "  ", declaration: true });

    return text;
  }

  function cleanup () {
    quick_temp.remove(tmp, "path");
  }
}

function entry (root, file) {
  var href = "http://www.brainshave.com" + file.href;
  var title = file.title;
  var date = file.date;

  var content = cheerio.load(fs.readFileSync(join(root, file.path), "utf8"));
  var article = content("article").html();

  return { entry: [
    { title: file.title },
    { link: { _attr: { href: href } } },
    { updated: date },
    { id: href },
    { content: [
      { _attr: { type: "html" } },
      article
    ] }
  ] };
}

function feed (name, entries) {
  var href = "http://www.brainshave.com/" + name.toLowerCase();
  return { feed: [
    { _attr: { xmlns: "http://www.w3.org/2005/Atom" } },
    { title: "brainshave " + name.toLowerCase() },
    { link: { _attr: { rel: "self", href: href } } },
    { link: { _attr: { href: "http://www.brainshave.com" } } },
    { updated: new Date().toISOString() },
    { id: href },
    { author: [
      { name: "Szymon Witamborski" },
      { email: "simon@brainshave.com" }
    ] }
  ].concat(entries || []) };
}
