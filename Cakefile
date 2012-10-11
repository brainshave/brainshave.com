fs      = require 'fs'
path    = require 'path'
jade    = require 'jade'
stylus  = require 'stylus'
nib     = require 'nib'
marked  = require 'marked'
connect = require 'connect'
coffee  = require 'coffee-script'
_       = require 'underscore'

# app = connect().use(connect.static __dirname).listen 8080

get_jade_deps = (callback, file_path) ->
  if not (/\.jade$/).test file_path
    callback null, []
    return []

  content = fs.readFileSync file_path, 'utf8'
  dir = "#{path.dirname file_path}/".replace './', ''
  deps = for match in content.match(/(extends|include)\s+([a-zA-Z\/]+)/g) or []
    "#{dir}#{match.replace(/(extends|include)\s+/, '')}.jade"
  extra_deps = for dep in deps
    get_jade_deps(null, dep)
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

index = (field_name) -> (callback, output_path, input_paths...) ->
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
    content = {}
    content[field_name] = index
    callback null, JSON.stringify content
  , (save 'utf8')
  go arguments...

compile_jade = (callback, output_path, paths...) ->
  jade_path = _.find paths, (x) -> /\.jade$/.test x
  json_paths = paths.filter (path) -> (/\.json$/).test path
  go = flow (read 'utf8')
  , (callback, jade_source, json_sources...) ->
    title    = jade_path.substring 0, jade_path.indexOf '/'
    objects  = _.extend title: title, (JSON.parse json for json in json_sources)...
    template = jade.compile jade_source, filename: jade_path, pretty: true
    result   = template objects
    callback null, result
  , (save 'utf8')
  go callback, output_path, jade_path, json_paths...

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
  in:  'index.jade|*/index.json'
  out: 'index.html'
  run: compile_jade
  dep: get_jade_deps

recipe
  in:  '*.jade'
  out: '*.html'
  run: compile_jade
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
  in:  '*/*.md'
  out: '*/index.json'
  run: (callback, output_path) ->
    name = output_path.match(/^[^/]+/)[0]
    (index name) arguments...

recipe
  in:  '*/index.(jade|json)'
  out: '*/index.html'
  run: compile_jade
  dep: get_jade_deps

recipe
  in:  'styles/*.styl'
  out: 'styles/all.css'
  run: (flow (read 'utf8'),
             (do_all (callback, src) -> stylus(src).use(nib()).render callback),
             join(),
             (save 'utf8'))
