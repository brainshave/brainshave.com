var fs     = require('fs');
var path   = require('path');
var marked = require('marked');
var dot    = require('dot');
var stylus = require('stylus');
var nib    = require('nib');
var _      = require('underscore');

var meta   = require('./lib/meta');
var beauty = require('./lib/beauty');

var jam = process.platform === 'win32' ? 'jam.cmd' : 'jam';

recipe({
  'in':  'styles/*.styl',
  out: 'styles/all.css',
  run: flow(
    read('utf8'),
    do_all(function compile_stylus (src, callback) {
      stylus(src).use(nib()).render(callback);
    }),
    join(),
    save('utf8'))
});


recipe({
  'in': 'package.json',
  out: 'deps/require.js',
  run: function (deps, callback) {
    spawn(jam, ['upgrade'], spawn['default'](callback));
  }
});

recipe({
  'in': '*/*.md',
  out: '*/*.json',
  run: flow(
    read('utf8'),
    compile(function (md) {
      md = beauty.md(md);
      return _.extend(meta.info(this.deps[0], md), {
        md: md,
        html: beauty.html(marked.parse(md))
      });
    }),
    remember,
    compile(JSON.stringify),
    save('utf8'))
});

function with_template (info, callback) {
  var tmpl = require(path.resolve(this.deps[1]));
  return tmpl(info);
}

recipe({
  'in': '*/index.json',
  also: ['templates/list.js'],
  out: '*/index.html',
  run: flow(
    take(1),
    read('utf8'),
    compile(unjson),
    compile(function (index) {
      return {
        title: this.deps[0],
        list:  index
      };
    }),
    compile(with_template),
    save('utf8'))
});

recipe({
  'in': '*/*.json',
  also: ['templates/*.js'],
  out: '*/*.html',
  run: flow(
    take(1),
    read('utf8'),
    compile(unjson),
    compile(with_template),
    save('utf8'))
});

function unjson (item, callback) {
  return typeof item === 'string' ? JSON.parse(item) : item;
}

recipe({
  'in': '*/*.json',
  out: '*/index.json',
  run: flow(
    read('utf8'),
    compile(unjson),
    function (items, callback) {
      var index = _.sortBy(items, 'date').reverse();
      callback(null, [index]);
    },
    remember,
    compile(JSON.stringify),
    save('utf8'))
});


var amd_wrapper = dot.template("define(function () { return {{= it }}; });");
var commonjs_wrapper = dot.template("module.exports = {{= it }};");

function include (reference_path, include_path) {
  return fs.readFileSync(
    path.relative('.', path.join(reference_path, include_path)));
}

recipe({
  'in': 'app/*.html',
  out: 'app/*.js',
  run: flow(
    take(1),
    read('utf8'),
    compile(dot.template),
    compile(amd_wrapper),
    save('utf8'))
});

recipe({
  'in': 'templates/*.(html|xml)',
  out: 'templates/*.js',
  // dep: meta.js_deps,
  run: flow(
    take(1),
    read('utf8'),
    compile(function (src) {
      return dot.template(src, null, {
        include: include.bind(null, this.deps[0])
      });
    }),
    compile(commonjs_wrapper),
    save('utf8'))
});

recipe({
  'in': 'app/*.js',
  out: 'app.js',
  run: function (deps, callback) {
    spawn(jam,
      'compile --no-license -a -i app -i github -i photos -o app.js'.split(' '),
      spawn['default'](callback));
  }
});
