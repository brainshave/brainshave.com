fs = require 'fs'
step = require 'step'
jade = require 'jade'
stylus = require 'stylus'
nib = require 'nib'
marked = require 'marked'
connect = require 'connect'
coffee = require 'coffee-script'

translate_input_pattern = (pattern) ->
  new RegExp "^#{pattern.replace /\*./g, (match) -> "([^#{match[1]}./]+)\\#{match[1]}"}$"

translate_output_pattern = (pattern) ->
  count = 1
  pattern.replace /\*/g, (match) -> "$#{count++}"

scan_dir = (path) ->
  files = fs.readdirSync path
  paths = ((path + '/' + name).replace('./', '') for name in files)
  paths.concat(scan_dir path for path in paths when fs.statSync(path).isDirectory() ...)

get_deps = (target, input_paths) ->
  if typeof target.get_deps is 'function'
    [].concat (target.get_deps input_path for input_path in input_paths)...
  else
    []

build = (targets) ->
  all_paths = scan_dir '.'
  for target in targets when typeof target.compile is 'function'
    input_pattern = translate_input_pattern target.pattern
    output_pattern = translate_output_pattern target.save_as
    matching_paths = all_paths.filter (path) -> input_pattern.test(path)

    outputs = {}
    for input_path in matching_paths
      output_path = input_path.replace input_pattern, output_pattern
      outputs[output_path] = [] if not outputs[output_path]?.push?
      outputs[output_path].push input_path

    for own output_path, input_paths of outputs
      deps = get_deps target, input_paths
      console.log "Building #{output_path} from #{input_paths.join(', ')} with #{deps.join(', ')}"
      target.compile output_path, input_paths..., deps...

# Flow stuff

flow_next = (steps, final_step, output_path) -> (err, data...) ->
  if err
    console.error err.stack or err
    return
  if steps.length
    steps[0] (flow_next steps[1..], final_step, output_path), data...
  else
    final_step output_path, data...

flow = (steps..., final_step) -> (output_path, data...) ->
  (flow_next steps, final_step, output_path) null, data...

do_all = (iterator) -> (callback, data...) ->
  results = []
  got = 0
  valid = true
  check = (i) -> (err, result) ->
    return if not valid
    if err
      callback err
      return
    results[i] = result
    got++
    if got is data.length
      callback null, results...
  for datum, i in data
    iterator (check i), datum

read_one = (encoding) -> (callback, input_path) ->
  fs.readFile input_path, encoding, callback

read = (encoding) -> do_all read_one encoding

save = (encoding) -> (output_path, data) ->
  fs.writeFileSync output_path, data, encoding

compile = (compiler, args...) -> (callback, sources...) ->
  results = []
  try
    results = (compiler src, args... for src in sources)
  catch err
    error = err
  finally
    callback error, results...

join = (glue = '\n') -> (callback, contents...) ->
  callback null, contents.join glue

take = (amount) -> (callback, data...) ->
  callback null, data[..amount]...

# Specific configuration

get_jade_deps = (templates_path, file_path) ->
  content = fs.readFileSync file_path, 'utf8'
  deps = for match in content.match(/(extends|include)\s+([a-zA-Z]+)/g) or []
    "#{templates_path}/#{match.replace(/(extends|include)\s+/, '')}.jade"
  extra_deps = for dep in deps
    get_jade_deps(templates_path, dep)
  deps.concat(extra_deps...)

get_markdown_deps = (templates_path, path) ->
  deps = ["#{templates_path}/#{path.substring(0, path.indexOf('/'))}.jade"]
  deps.concat get_jade_deps templates_path, deps[0]

compile_jade = (content) ->
  jade.compile content, filename: 'templates/basic.jade', pretty: true

title_matcher = /^\#\s*([^\#].*)/
get_title = (source) -> (source.match title_matcher)[1]
date_matcher = /\d{4}-\d{2}-\d{2}/
get_date = (source) -> new Date (source.match date_matcher)[0]

index = (output_path, input_paths...) ->
  index = []
  go = flow (read 'utf8')
  , (do_all (callback, source) ->
      callback null, title: (get_title source), date: (get_date source))
  , (callback, index...) ->
    for element, i in index
      element.href = input_paths[i].replace /\.md$/, '.html'
    index.sort (a, b) -> a.date < b.date and 1 or a.date == b.date and 0 or -1
    callback null, JSON.stringify index
  , (save 'utf8')
  go arguments...

targets = [
  {
    pattern: '*/*.md'
    save_as: '*/*.html'
    compile: (output_path, md_path, jade_path) ->
      go = flow (take 2)
      , (read 'utf8')
      , (callback, md_source, jade_source) ->
        try
          template = jade.compile jade_source, filename: jade_path, pretty: true
          result = template title: (get_title md_source), article: (marked.parse md_source)
        catch err
          error = err
        finally
          callback error, result
      , (save 'utf8')
      go arguments...
    get_deps: get_markdown_deps.bind null, 'templates'
  }
  {
    pattern: '*.jade'
    save_as: '*.html'
    compile: flow (read 'utf8')
      , (compile jade.compile, filename: 'templates/.jade', pretty: true)
      , ((callback, template) -> callback null, template index: [])
      , (save 'utf8')
    get_deps: get_jade_deps.bind null, 'templates'
  }
  {
    pattern: 'app/*.coffee'
    save_as: 'app/*.js'
    compile: flow read('utf8'), compile(coffee.compile), save('utf8')
  }
  {
    pattern: 'app/*.coffee'
    save_as: 'app/all1.js'
    compile: flow read('utf8'), join(), compile(coffee.compile), save('utf8')
  }
  {
    pattern: 'app/*.coffee'
    save_as: 'app/all2.js'
    compile: flow read('utf8'), compile(coffee.compile), join(), save('utf8')
  }
  {
    pattern: '*/*.md'
    save_as: 'index.json'
    compile: index
  }
  {
    pattern: '*/*.md'
    save_as: '*/index.json'
    compile: index
  }
  {
    pattern: 'styles/*.styl'
    save_as: 'styles/all.css'
    compile: flow (read 'utf8')
      , (do_all (callback, src) -> stylus(src).use(nib()).render callback)
      , join()
      , (save 'utf8')
  }
]

task 'build', 'Build whole site', (options) ->
  build targets
