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
      console.log "Building #{output_path} from #{input_paths.join(', ')}"
      target.compile output_path, input_paths...

read = (encoding) -> (callback, input_paths...) ->
  callback null, (fs.readFileSync input_path, encoding for input_path in input_paths)...

save = (encoding) -> (output_path, data) ->
  fs.writeFileSync output_path, data, encoding

compile = (compiler, args...) -> (callback, sources...) ->
  callback null, (compiler src, args... for src in sources)...

join = (glue = '\n') -> (callback, contents...) ->
  callback null, contents.join glue

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

gen_template = (name) ->
  """
  extends #{name}
  prepend title
    |\#{title}
  block article
    !{content}
  """

title_matcher = /^\#\s*([^\#].*)/

targets = [
  {
    pattern: '*/*.md'
    save_as: '*/*.html'
    # compile: (content, path, template_path) ->
    #   template = compile_jade gen_template (template_path.match /([^\/.]+)\.jade/)[1]
    #   title = (content.match title_matcher)[1] or path
    #   template title: title, content: marked.parse content
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
    # compile: () -> null
  }
  {
    pattern: '*/*.md'
    save_as: '*/index.json'
    # compile: () -> null
  }
  {
    pattern: 'styles/*.styl'
    save_as: 'styles/all.css'
    compile: flow (read 'utf8')
      , (callback, sources...) ->
          csss = []
          got = 0
          for src, i in sources
            stylus(src).use(nib()).render (err, css) ->
              if err
                callback err
                return
              csss[i] = css
              got++
              if got is sources.length
                callback null, csss...
      , join()
      , (save 'utf8')
  }
]

task 'build', 'Build whole site', (options) ->
  build targets
