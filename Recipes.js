var fs     = require('fs');
var path   = require('path');
var marked = require('marked');
var dot    = require('dot');
var stylus = require('stylus');
var nib    = require('nib');
var _      = require('underscore');
var uglify = require('uglify-js').minify;

var meta   = require('./lib/meta');
var beauty = require('./lib/beauty');
var dots   = require('./lib/dots');

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

var SOUREMAP_PATH = 'app.map.json';

recipe({
  'in': 'app/*.js',
  out: 'app.min.js',
  run: function (paths, callback) {

    sort_scripts(paths);

    var result = uglify(paths, {
      outSourceMap: SOUREMAP_PATH,
      wrap:         'szywon'
    });

    result.code += '\n//@ sourceMappingURL=' + SOUREMAP_PATH;

    do_all(function (desc, cb) {
      fs.writeFile(desc.path, desc.data, cb);
    })([{
      path: this.path,
      data: result.code
    }, {
      path: SOUREMAP_PATH,
      data: result.map
    }], callback);
  }
});

recipe({
  'in': 'app/*.js',
  out: 'source_list.json',
  run: flow(function (paths, callback) {
    sort_scripts(paths);
    callback(null, [JSON.stringify(paths)]);
  }, save('utf8'))
});
