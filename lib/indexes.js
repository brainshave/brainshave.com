"use strict";

var fs = require("fs");
var dirname = require("path").dirname;
var join = require("path").join;

var mode = require("./buildmode");

var _ = require("underscore");
var walk_sync = require("walk-sync");
var quick_temp = require("quick-temp");
var mkdirp = require("mkdirp");

module.exports = indexes;

function indexes (input, options) {
  var template = options.template;

  var tmp = {};
  quick_temp.makeOrReuse(tmp, "path");

  return {
    read:    read,
    cleanup: cleanup
  }

  function read (read_tree) {
    return read_tree(input).then(run);
  }

  function run (root) {
    var files = walk_sync(root).filter(function (path) {
      return /.*\/.*\.(md|html)$/.test(path);
    });

    _.chain(files).groupBy(dirname).forEach(function (files, dir) {
      files = _.chain(files).map(function (file) {
        var head = JSON.parse(fs.readFileSync(join(root, file), "utf8").split("\n\n", 1));
        head.path = "/" + file.replace(/\.[^\/]+$/, ".html");
        head.href = (mode === "prod"
                     ? head.path.replace(/\.html$/, "")
                     : head.path);
        return head;
      }).sortBy("date").value().reverse();

      var index = {
        title: dir.replace(/(^|\b)\w/g, function (ch) { return ch.toUpperCase(); }),
        files: files,
        template: template
      };

      var out = join(tmp.path, dir, "index.html");

      mkdirp.sync(dirname(out));
      fs.writeFileSync(out,
                       JSON.stringify(index),
                       "utf8");
    });

    return tmp.path;
  }

  function cleanup () {
    quick_temp.remove(tmp, "path");
  }
}
