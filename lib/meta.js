var fs = require('fs');
var path = require('path');

var title_matcher = /^\#\s*([^\#].*)/;

function title (source) {
  var match = source.match(title_matcher);
  return match && match[1];
}

var date_matcher = /\d{4}-\d{2}-\d{2}/;

function date (source) {
  var match = source.match(date_matcher);
  return match && new Date(match[0]);
}

var extension_matcher = /\.\w+$/;

function href (path) {
  return path.replace(extension_matcher, '.html');
}

function info (path, md) {
  return {
    title:   title(md),
    date:    date(md),
    href:    href(path),
    md_path: path
  };
}

function unjson (item, callback) {
  return typeof item === 'string' ? JSON.parse(item) : item;
}

var require_matcher = /require\s*\(['"]([^'"]+)/g;

function deps (matcher, extension) {
  extension = extension || '';
  return do_all(function (input_path, callback) {
    fs.readFile(input_path, 'utf8', function (err, src) {
      if (err) {
        callback(err);
        return;
      }

      var dependencies = [];
      var dep;
      for(dep = matcher.exec(src); dep; dep = matcher.exec(src)) {
        dependencies.push(
          path.relative('.',
            path.join(path.dirname(input_path), dep[1] + extension)));
      }

      callback(null, dependencies);
    });
  });
}

module.exports = {
  title:  title,
  date:   date,
  href:   href,
  info:   info,
  deps:   deps,
  unjson: unjson
};
