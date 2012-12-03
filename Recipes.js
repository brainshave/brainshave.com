var fs     = require('fs');
var path   = require('path');
var marked = require('marked');
var dot    = require('dot');
var stylus = require('stylus');
var nib    = require('nib');
var _      = require('underscore');

var meta   = require('./lib/meta');
var beauty = require('./lib/beauty');
var dots   = require('./lib/dots');

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

recipe({
  'in': '*/index.json',
  also: ['templates/list.js'],
  out: '*/index.html',
  run: flow(
    take(1),
    read('utf8'),
    compile(meta.unjson),
    compile(function (index) {
      return {
        title: this.deps[0],
        list:  index
      };
    }),
    compile(dots.with_template),
    save('utf8'))
});

recipe({
  'in': '*/*.json',
  also: ['templates/*.js'],
  out: '*/*.html',
  run: flow(
    take(1),
    read('utf8'),
    compile(meta.unjson),
    compile(dots.with_template),
    save('utf8'))
});

recipe({
  'in': '*/*.json',
  out: '*/index.json',
  run: flow(
    read('utf8'),
    compile(meta.unjson),
    function (items, callback) {
      var index = _.sortBy(items, 'date').reverse();
      callback(null, [index]);
    },
    remember,
    compile(JSON.stringify),
    save('utf8'))
});

recipe({
  'in': 'app/*.html',
  out: 'app/*.js',
  run: flow(
    take(1),
    read('utf8'),
    compile(dot.template),
    compile(dots.amd_wrapper),
    save('utf8'))
});

recipe({
  'in': 'templates/*.html',
  out: 'templates/*.js',
  dep: meta.deps(dots.include_matcher, '.html'),
  run: flow(
    take(1),
    read('utf8'),
    compile(function (src) {
      return dot.template(src, null, {
        include: dots.include.bind(null, this.deps[0])
      });
    }),
    compile(dots.commonjs_wrapper),
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
