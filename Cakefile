fs = require 'fs'
path = require 'path'
jade = require 'jade'
stylus = require 'stylus'
nib = require 'nib'
marked = require 'marked'
connect = require 'connect'
coffee = require 'coffee-script'
_ = require 'underscore'

translate_input_pattern = (pattern) ->
  new RegExp "^#{pattern.replace /\*./g, (match) -> "([^#{match[1]}./]+)\\#{match[1]}"}$"

translate_output_pattern = (pattern) ->
  count = 1
  pattern.replace /\*/g, (match) -> "$#{count++}"

scan_dir = (path) ->
  files = fs.readdirSync path
  paths = ((path + '/' + name).replace('./', '') for name in files)
  paths.concat(scan_dir path for path in paths when fs.statSync(path).isDirectory() ...)

gen_final_callback = (output_path, outputs) -> (err) ->
  output = outputs[output_path]
  if err
    console.error "Error while building #{output_path}", err.stack or err
  else
    console.log "Built #{output_path}"
    for next_path in output.nexts
      next = outputs[next_path]
      next.awaiting = _.without next.awating, output_path
      build_one next_path, outputs

build_one = (output_path, outputs) ->
  output = outputs[output_path]
  if output.awaiting.length is 0
    console.log "Building #{output_path} from #{output.deps.join(', ')}"
    callback = gen_final_callback output_path, outputs
    output.recipe.compile callback, output_path, output.deps... # TODO: try catch
  else
    console.log "recipe #{output_path} is waiting for #{output.awaiting.join ', '}"

group_outputs_inputs = (recipes, paths) ->
  outputs = {}
  for recipe in recipes when typeof recipe.compile is 'function'
    input_pattern = translate_input_pattern recipe.pattern
    output_pattern = translate_output_pattern recipe.save_as
    matching_paths = paths.filter (path) -> input_pattern.test(path)

    # Group all inputs by their outputs.
    for input_path in matching_paths
      output_path = input_path.replace input_pattern, output_pattern
      outputs[output_path] = { recipe: recipe, deps: [], nexts: [], awaiting: [] } if not outputs[output_path]
      outputs[output_path].deps.push input_path
  outputs

get_recipe_deps = (recipe, input_paths) ->
  _.uniq if typeof recipe.get_deps is 'function'
    input_paths.concat (recipe.get_deps input_path for input_path in input_paths)...
  else
    input_paths

get_outputs_deps = (outputs) ->
  for own output_path, output of outputs
    deps = output.deps = get_recipe_deps output.recipe, output.deps # TODO: try catch
    # Interdepencies are discovered here:
    for dep in deps
      if outputs[dep]
        outputs[dep].nexts.push output_path
        output.awaiting.push dep
  outputs

build = (outputs) ->
  for own output_path of outputs
    build_one output_path, outputs

rm = (path) ->
  console.log "Deleting #{path}"
  fs.unlink path, (err) -> if err then console.error err.stack or err

clean = (outputs) ->
  rm output_path for own output_path of outputs when fs.existsSync output_path

purify = (recipes, paths) ->
  matching_paths = []
  for recipe in recipes
    output_pattern = translate_input_pattern recipe.save_as
    matching_paths = _.union matching_paths, paths.filter (path) -> output_pattern.test(path)

  rm path for path in matching_paths

# Flow stuff

flow_next = (steps, final_step, final_callback, output_path) -> (err, data...) ->
  if err
    # console.error "Error while building #{output_path}", err.stack or err
    final_callback err, data...
  else if steps.length
    callback = flow_next steps[1..], final_step, final_callback, output_path
    try
      steps[0] callback, data...
    catch err
      callback err
  else if final_step
    final_step (flow_next [], null, final_callback), output_path, data...
  else
    final_callback null, data...

flow = (steps..., final_step) -> (final_callback, output_path, data...) ->
  (flow_next steps, final_step, final_callback, output_path) null, data...

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

save = (encoding) -> (callback, output_path, data) ->
  fs.writeFile output_path, data, encoding, callback

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
  dir = "#{path.dirname file_path}/".replace './', ''
  deps = for match in content.match(/(extends|include)\s+([a-zA-Z\/]+)/g) or []
    "#{dir}#{match.replace(/(extends|include)\s+/, '')}.jade"
  extra_deps = for dep in deps
    get_jade_deps(templates_path, dep)
  deps.push 'index.json' if (/\bindex\b/).test content
  deps.concat(extra_deps...)

get_markdown_deps = (templates_path, path) ->
  deps = ["#{templates_path}/#{path.substring(0, path.indexOf('/'))}.jade"]
  deps.concat get_jade_deps templates_path, deps[0]

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

recipes = [
  {
    pattern: '*/*.md'
    save_as: '*/*.html'
    compile: (callback, output_path, md_path, jade_path) ->
      go = flow (take 2)
      , (read 'utf8')
      , (callback, md_source, jade_source) ->
        template = jade.compile jade_source, filename: jade_path, pretty: true
        result = template title: (get_title md_source), article: (marked.parse md_source)
        callback null, result
      , (save 'utf8')
      go arguments...
    get_deps: get_markdown_deps.bind null, 'templates'
  }
  {
    pattern: '*.jade'
    save_as: '*.html'
    compile: (callback, output_path, jade_path, rest...) ->
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
    get_deps: get_jade_deps.bind null, 'templates'
  }
  {
    pattern: 'app/*.coffee'
    save_as: 'app/*.js'
    compile: flow read('utf8'), compile(coffee.compile), save('utf8')
  }
  {
    pattern: 'app/*.jade'
    save_as: 'app/*.js'
    compile: (callback, output_path, jade_path) ->
      go = flow (take 1), (read 'utf8')
      , (callback, jade_source) ->
        template = jade.compile jade_source, filename: jade_path, pretty: true, client: true
        callback null, "define(['jade-runtime'], function (jade) { return #{template}; });"
      , (save 'utf8')
      go arguments...
    get_deps: get_jade_deps.bind null, 'app'
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
    pattern: '*/*.(md|jade)'
    save_as: 'index.json'
    compile: index
  }
  {
    pattern: '*/*.(md|jade)'
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

task 'build', 'Build all targets', (options) ->
  build get_outputs_deps group_outputs_inputs recipes, scan_dir '.'

task 'clean', 'Delete all targets', (options) ->
  clean group_outputs_inputs recipes, scan_dir '.'

task 'purify', 'Delete all files matching output paths', (options) ->
  purify recipes, scan_dir '.'

task 'dump', 'Dump dependency tree', (options) ->
  console.log get_outputs_deps group_outputs_inputs recipes, scan_dir '.'
