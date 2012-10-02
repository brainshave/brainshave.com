fs      = require 'fs'
path    = require 'path'
jade    = require 'jade'
stylus  = require 'stylus'
nib     = require 'nib'
marked  = require 'marked'
connect = require 'connect'
coffee  = require 'coffee-script'
_       = require 'underscore'

get_jade_deps = (callback, file_path) ->
  content = fs.readFileSync file_path, 'utf8'
  dir = "#{path.dirname file_path}/".replace './', ''
  deps = for match in content.match(/(extends|include)\s+([a-zA-Z\/]+)/g) or []
    "#{dir}#{match.replace(/(extends|include)\s+/, '')}.jade"
  extra_deps = for dep in deps
    get_jade_deps(null, dep)
  deps.push 'index.json' if (/\bindex\b/).test content
  deps = deps.concat extra_deps...
  if callback
    callback null, deps
  else
    deps

get_markdown_deps = (callback, path) ->
  deps = ["templates/#{path.substring(0, path.indexOf('/'))}.jade"]
  get_jade_deps ((err, paths) -> callback err, deps.concat paths), deps[0]

title_matcher = /^\#\s*([^\#].*)/
get_title = (source) -> (source.match title_matcher)?[1]
date_matcher = /\d{4}-\d{2}-\d{2}/
get_date = (source) -> new Date (source.match date_matcher)?[0]

index = (callback, output_path, input_paths...) ->
  go = flow (read 'utf8')
  , (do_all (callback, source) ->
      title = get_title source
      date = get_date source
      callback null, (title and date and {title: title, date: date}))
  , (callback, index...) ->
    index = (for element, i in index when element?
      element.href = input_paths[i].replace /\.md$/, '.html'
      element)
    index.sort (a, b) -> a.date < b.date and 1 or a.date == b.date and 0 or -1
    callback null, JSON.stringify index: index
  , (save 'utf8')
  go arguments...

recipe
  in:  '*/*.md'
  out: '*/*.html'
  run: (callback, output_path, md_path, jade_path) ->
    go = flow (take 2)
    , (read 'utf8')
    , (callback, md_source, jade_source) ->
      template = jade.compile jade_source, filename: jade_path, pretty: true
      result = template title: (get_title md_source), article: (marked.parse md_source)
      callback null, result
    , (save 'utf8')
    go arguments...
  dep: get_markdown_deps

recipe
  in:  '*.jade'
  out: '*.html'
  run: (callback, output_path, jade_path, rest...) ->
    go = flow (callback, jade_path, rest...) ->
      callback null, jade_path, (rest.filter (path) -> (/\.json$/).test path)...
    , (read 'utf8')
    , (callback, jade_source, json_sources...) ->
      objects = _.extend (JSON.parse json for json in json_sources)...
      template = jade.compile jade_source, filename: jade_path, pretty: true
      result = template objects
      callback null, result
    , (save 'utf8')
    go arguments...
  dep: get_jade_deps

recipe
  in:  'app/*.coffee'
  out: 'app/*.js'
  run: (flow read('utf8'), compile(coffee.compile), save('utf8'))

recipe
  in:  'app/*.jade'
  out: 'app/*.js'
  run: (callback, output_path, jade_path) ->
    go = flow (take 1), (read 'utf8')
    , (callback, jade_source) ->
      template = jade.compile jade_source, filename: jade_path, pretty: true, client: true
      callback null, "define(['jade-runtime'], function (jade) { return #{template}; });"
    , (save 'utf8')
    go arguments...
  dep: get_jade_deps

recipe
  in:  'app/*.js'
  out: 'app.js'
  run: (flow (read 'utf8'), join(), (save 'utf8'))

recipe
  in:  '*/*.md'
  out: 'index.json'
  run: index

recipe
  in:  'styles/*.styl'
  out: 'styles/all.css'
  run: (flow (read 'utf8'),
             (do_all (callback, src) -> stylus(src).use(nib()).render callback),
             join(),
             (save 'utf8'))
