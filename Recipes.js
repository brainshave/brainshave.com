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


var compile_index = flow(
  take(1),
  read('utf8'),
  compile(meta.unjson),
  compile(function (index) {
    return {
      title: meta.index_title(this.deps[0]),
      path:  this.path,
      list:  index
    };
  }),
  compile(dots.with_template),
  save('utf8'));

recipe({
  'in': '*/index.json',
  also: ['templates/list.js'],
  out: '*/index.html',
  run: compile_index
});

recipe({
  'in': '*/index.json',
  also: ['templates/atom.js'],
  out: '*/index.xml',
  run: compile_index
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

var dot_deps = meta.deps(dots.include_matcher, '.html');

function dot_compile (src) {
  return dot.compile(src, {
    include: dots.include.bind(null, '.html', this.deps[0])
  });
}

function dot_use (tmpl) {
  return tmpl({
    json: dots.include_json.bind(null, this.deps[0])
  });
}

recipe({
  'in': 'templates/*.(html|xml)',
  out: 'templates/*.js',
  dep: dot_deps,
  run: flow(
    take(1),
    read('utf8'),
    compile(dot_compile),
    compile(dots.commonjs_wrapper),
    save('utf8'))
});

recipe({
  'in': '*.in.html',
  out: '*.html',
  dep: dot_deps,
  run: flow(
    take(1),
    read('utf8'),
    compile(dot_compile),
    compile(dot_use),
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