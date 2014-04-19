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

function atom (options) {
  var indexes = options.indexes;
  var pages   = options.pages;

  var tmp = {};
  quick_temp.makeOrReuse(tmp, "path");

  return {
    read:    read,
    cleanup: cleanup
  }

  function read (read_tree) {
    return map_series([indexes, pages], read_tree).then(run);
  }

  function run (paths) {
    var indexes_root = paths[0];
    var pages_root = paths[1];

    var index_files = walk_sync(indexes_root).filter(function (path) {
      return /index\.dot\.html$/.test(path);
    });

    index_files.forEach(function (index) {
      var head = JSON.parse(fs.readFileSync(join(indexes_root, index), "utf8").split("\n\n", 1));

      var out = join(tmp.path, dirname(index), "index.xml");

      var data = feed(head.title, head.files.slice(0, 10).map(entry.bind(null, pages_root)));
      var text = xml(data, { indent: "  ", declaration: true });

      mkdirp.sync(dirname(out));
      fs.writeFileSync(out, text, "utf8");
    });

    return tmp.path;
  }

  function cleanup () {
    quick_temp.remove(tmp, "path");
  }
}

function entry (root, file) {
  var href = "http://szywon.pl" + file.href;
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
  var href = "http://szywon.pl/" + name.toLowerCase();
  return { feed: [
    { _attr: { xmlns: "http://www.w3.org/2005/Atom" } },
    { title: "S/W " + name },
    { link: { _attr: { rel: "self", href: href } } },
    { link: { _attr: { href: "http://szywon.pl" } } },
    { updated: new Date().toISOString() },
    { id: href },
    { author: [
      { name: "Szymon Witamborski" },
      { email: "szywon@szywon.pl" }
    ] }
  ].concat(entries || []) };
}
