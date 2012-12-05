var fs   = require('fs');
var path = require('path');
var dot  = require('dot');
var _    = require('underscore');

var meta = require('./meta');

var include_matcher = /def\.include\s*\(['"]([^'"]+)/g;
var json_matcher = /it\.json\s*\(['"]([^'"]+)/g;

var amd_wrapper = dot.template("define(function () { return {{= it }}; });");
var commonjs_wrapper = dot.template("module.exports = {{= it }};");
var module_wrapper = dot.template(
  "ns('{{= it.ns }}').{{= it.name }} = {{= it.src }};");

function wrap (src) {
  var parts = this.path.replace(/\\|\/|_/g, '.').split('.');

  parts.pop(); // extension
  parts[0] = 'szywon'; // replaces 'app'

  var name = parts.pop();
  var ns   = parts.join('.');

  return module_wrapper({
    ns:   ns,
    name: name,
    src:  src
  });
}

function include (extension, reference_path, include_path) {
  return fs.readFileSync(meta.sibling(reference_path, include_path + extension));
}

function include_json (reference_path, include_path) {
  return JSON.parse(include('.json', reference_path, include_path));
}

function with_template (info, callback) {
  var tmpl = require(path.resolve(this.deps[1]));
  return tmpl(_.extend({}, info, {
    json: include_json.bind(null, this.deps[1])
  }));
}

var deps = meta.deps([{
  matcher: include_matcher,
  extension: '.html'
}, {
  matcher: json_matcher,
  extension: '.json'
}]);

function compile (src) {
  return dot.compile(src, {
    include: include.bind(null, '.html', this.deps[0])
  });
}

function use (tmpl) {
  return tmpl({
    json: include_json.bind(null, this.deps[0])
  });
}

module.exports = {
  compile: compile,
  use:     use,
  deps:    deps,
  wrap:    wrap,

  amd_wrapper:      amd_wrapper,
  commonjs_wrapper: commonjs_wrapper,
  include:          include,
  include_json:     include_json,
  include_matcher:  include_matcher,
  json_matcher:     json_matcher,
  with_template:    with_template
};
