var fs     = require('fs');
var path   = require('path');
var dot    = require('dot');
var stylus = require('stylus');
var nib    = require('nib');
var _      = require('underscore');
var uglify = require('uglify-js').minify;
var csso   = require('csso').justDoIt;

var meta = require('./lib/meta');
var md   = require('./lib/md');
var dots = require('./lib/dots');

var BuildMode = require('./lib/buildmode');
var mode      = new BuildMode('master');

var DEBUG   = mode.debug();
var RELEASE = mode.release();

recipe({
  'in': '*/*.md',
  out: '*/*.json',
  run: flow(
    read('utf8'),
    compile(function (text) {
      return _.extend(meta.info(this.deps[0], text), {
        md: text,
        html: md(text)
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
  'in': 'app_templates/*.html',
  out: 'app_templates/*.js',
  run: flow(
    take(1),
    read('utf8'),
    compile(dot.template),
    compile(dots.wrap),
    save('utf8'))
});

recipe({
  'in': 'templates/*.(html|xml)',
  out: 'templates/*.js',
  dep: dots.deps,
  run: flow(
    take(1),
    read('utf8'),
    compile(dots.compile),
    compile(dots.commonjs_wrapper),
    save('utf8'))
});

recipe({
  'in': '*.in.html',
  out: '*.html',
  dep: dots.deps,
  run: flow(
    take(1),
    read('utf8'),
    compile(dots.compile),
    compile(dots.use),
    save('utf8'))
});

var MAIN_JS_NAMES   = /\b(app|main)\.js$/;
var DEFINE_JS_NAMES = /\b(globals|defines)\.js$/;

function sort_scripts (paths) {
  // Put defines.js as first and app.js as last:
  return paths.sort(function (a, b) {
    if (MAIN_JS_NAMES.test(a) || DEFINE_JS_NAMES.test(b)) return 1;
    if (MAIN_JS_NAMES.test(b) || DEFINE_JS_NAMES.test(a)) return -1;
    return 0;
  });
}

var APP_SOURCES = '(app|app_templates)/*.js';

if (RELEASE) recipe({
  'in': APP_SOURCES,
  out: 'app.min.js',
  run: flow(function (paths, callback) {
    sort_scripts(paths);
    callback(null, [uglify(paths).code]);
  },
  save('utf8'))
});

recipe({
  'in': RELEASE ? 'app.min.js' : APP_SOURCES,
  out: 'sources_list.json',
  run: flow(function (paths, callback) {
    sort_scripts(paths);
    callback(null, [JSON.stringify(paths)]);
  },
  save('utf8'))
});

function compile_stylus (src, callback) {
  stylus(src).use(nib()).render(callback);
}

var MINIFIED_CSS = 'all.min.css';

if (RELEASE) recipe({
  'in':  'styles/*.styl',
  out: MINIFIED_CSS,
  run: flow(
    read('utf8'),
    do_all(compile_stylus),
    join(),
    compile(csso),
    save('utf8'))
});

if (DEBUG) recipe({
  'in':  'styles/*.styl',
  out: 'styles/*.css',
  run: flow(
    read('utf8'),
    do_all(compile_stylus),
    save('utf8'))
});

recipe({
  'in': RELEASE ? MINIFIED_CSS : 'styles/*.css',
  out: 'styles_list.json',
  run: flow(function (paths, callback) {
    callback(null, [JSON.stringify(paths)]);
  },
  save('utf8'))
});
