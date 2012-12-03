var fs   = require('fs');
var path = require('path');
var dot  = require('dot');

var meta = require('./meta');

var include_matcher = /def\.include\s*\(['"]([^'"]+)/g;
var json_matcher = /def\.include\s*\(['"]([^'"]+)/g;

var amd_wrapper = dot.template("define(function () { return {{= it }}; });");
var commonjs_wrapper = dot.template("module.exports = {{= it }};");

function include (extension, reference_path, include_path) {
  return fs.readFileSync(meta.sibling(reference_path, include_path + extension));
}

function include_json (reference_path, include_path) {
  return JSON.parse(include('.json', reference_path, include_path));
}

function with_template (info, callback) {
  var tmpl = require(path.resolve(this.deps[1]));
  return tmpl(info);
}

module.exports = {
  amd_wrapper:      amd_wrapper,
  commonjs_wrapper: commonjs_wrapper,
  include:          include,
  include_json:     include_json,
  include_matcher:  include_matcher,
  with_template:    with_template
};
