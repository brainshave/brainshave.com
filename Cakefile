fs      = require 'fs'
path    = require 'path'
jade    = require 'jade'
stylus  = require 'stylus'
nib     = require 'nib'
marked  = require 'marked'
connect = require 'connect'
coffee  = require 'coffee-script'
_       = require 'underscore'

get_jade_deps_one = (file_path, callback) ->
  if not (/\.jade$/).test file_path
    callback null, []
    return

  fs.readFile file_path, 'utf8', (err, content) ->
    if err
      callback err
      return

    dir = "#{path.dirname file_path}"
    deps = for match in content.match(/(extends|include)\s+([\.a-zA-Z\/]+)/g) or []
      (path.normalize "#{dir}/#{match.replace(/(extends|include)\s+/, '')}.jade").replace('\\', '/')

    get_jade_deps deps, (err, extra_deps) ->
      if err
        callback err
        return
      deps = deps.concat extra_deps...
      callback null, deps

get_jade_deps = do_all get_jade_deps_one

title_matcher = /^\#\s*([^\#].*)/
get_title = (source) -> (source.match title_matcher)?[1]
date_matcher = /\d{4}-\d{2}-\d{2}/
get_date = (source) -> new Date (source.match date_matcher)?[0]
get_href = (path) -> path.replace /\.md$/, '.html'

get_meta = (path, md) ->
  title:   get_title md
  date:    get_date md
  href:    get_href path
  md_path: path
  md:      md

index =
  flow (read 'utf8'),
    ((mds, callback) -> callback null, (for md, i in mds
      get_meta this.deps[i], md)),
    ((items, callback) -> callback null, [(_.sortBy items, 'date').reverse()]),
    remember

meta = {title: 'S/W'}

inspect = (data, callback) ->
  console.log this, data
  callback null, data

compile_jade =
  flow (read 'utf8'),
    ((srcs, callback) ->
      jade_src = null
      for dep, i in this.deps
        if /\.jade$/.test dep
          this.jade_path ?= dep
          jade_src ?= srcs[i]
        else if /\.json$/.test dep
          this[path.dirname dep] = srcs[i]
      callback null, [jade_src]),
    (compile (src) -> jade.compile src, filename: this.jade_path, pretty: true),
    (compile (template) -> template _.extend {}, meta, this),
    (save 'utf8')

compile_md =
  flow (take 1),
    (read 'utf8'),
    (([md], callback) ->
      _.extend this, (get_meta this.deps[0], md), article: marked.parse md
      callback null, this.deps),
    compile_jade

compile_list = (compile_md) ->
  flow (filter '*/*.json'),
    (read 'utf8'),
    ((lists, callback) ->
      items = (_.sortBy (_.flatten lists, true), 'date').reverse()
      # Give a name only if compiling a single list
      name = if lists.length is 1 then path.dirname this.deps[0] else ''
      _.extend this, list: items, name: name,
        title: (name.replace /\b\w/g, (x) -> x.toUpperCase())
        id:    "http://szywon.pl/#{if name then name + '/' else ''}index.xml"
        date:  items[0].date

      if compile_md
        for item in items
          _.extend item, content: (marked.parse item.md)

      callback null, this.deps),
    compile_jade

compile_jade_for_client =
  flow (read 'utf8'),
    (compile (src) -> jade.compile src, filename: this.path, pretty: true, client: true),
    (do_all (template, callback) -> callback null,
      "define(['jade-runtime'], function (jade) { return #{template}; });"),
    (save 'utf8')

recipe
  in:   '*/*.md'
  also: ['templates/*.jade']
  out:  '*/*.html'
  dep:  get_jade_deps
  run:  compile_md

recipe
  in:   '*/index.json'
  also: ['index.jade']
  out:  'index.html'
  dep:  get_jade_deps
  run:  compile_jade

recipe
  in:   '*/index.json'
  also: ['templates/list.jade']
  out:  '*/index.html'
  dep:  get_jade_deps
  run:  compile_list false

recipe
  in:   '*/index.json'
  also: ['templates/atom.jade']
  out:  '*/index.xml'
  dep:  get_jade_deps
  run:  compile_list true

recipe
  in:  '*.jade'
  out: '*.html'
  dep: get_jade_deps
  run: compile_jade

recipe
  in:  'app/*.coffee'
  out: 'app/*.js'
  run: (flow (read 'utf8'), compile(coffee.compile), (save 'utf8'))

recipe
  in:  'app/*.jade'
  out: 'app/*.js'
  dep: get_jade_deps
  run: compile_jade_for_client

recipe
  in:  '*/*.md'
  out: '*/index.json'
  run: index

recipe
  in:  'styles/*.styl'
  out: 'styles/all.css'
  run: (flow (read 'utf8'),
             (do_all (src, callback) -> stylus(src).use(nib()).render callback),
             join(),
             (save 'utf8'))

recipe
  in: 'package.json'
  out: 'deps/require.js'
  run: (deps, callback) ->
    spawn 'jam.cmd', ['upgrade'], spawn.default callback
