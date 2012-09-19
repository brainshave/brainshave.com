fs = require 'fs'
step = require 'step'
jade = require 'jade'
marked = require 'marked'
connect = require 'connect'
coffee = require 'coffee-script'

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

translate_pattern = (pattern) ->
  new RegExp "^#{pattern.replace /\*./g, (match) -> "([^#{match[1]}./]+)\\#{match[1]}"}$"

translate_save_pattern = (pattern) ->
  count = 1
  pattern.replace /\*/g, (match) -> "$#{count++}"

targets = [
  {
    pattern: '*/*.md'
    save_as: '*/*.html'
    compile: (content, path, deps...) -> null
    get_deps: get_markdown_deps.bind null, 'templates'
  }
  {
    pattern: '*.jade'
    save_as: '*.html'
    compile: (content, path, deps...) -> null
    get_deps: get_jade_deps.bind null, 'templates'
  }
  {
    pattern: 'app/*.coffee'
    save_as: 'app/*.js'
    compile: (content, path) -> coffee.compile content, filename: path
  }
  {
    pattern: '*/*.md'
    save_as: 'index.json'
    # compile: () -> null
  }
  {
    pattern: 'styles/*.styl'
    # compile: () -> null
    save_as: 'styles/all.css'
  }
]

# console.log([translate_pattern(target.pattern), translate_save_pattern(target.save_as)] for target in targets)

scan_dir = (path) ->
  files = fs.readdirSync path
  paths = ((path + '/' + name).replace('./', '') for name in files)
  paths.concat(scan_dir path for path in paths when fs.statSync(path).isDirectory() ...)

all_paths = scan_dir '.'

report_start = (path, output_path, deps) ->
  console.log "Starting #{path} -> #{output_path} [#{deps.join ", " }]"

report_end = (path, output_path, err) ->
  if err
    console.error "Error while compiling #{path} -> #{output_path}: #{err.stack or err}"
  else
    console.log "Done #{path} -> #{output_path}"

compile = (target, path) ->
  output_path = path.replace pattern, translate_save_pattern target.save_as
  deps = (target.get_deps? path) or []
  report_start path, output_path, deps
  step ->
    fs.readFile path, 'utf8', this
  , (err, content) ->
    try
      fs.writeFile output_path, (target.compile content, path, deps...), this
    catch err
      report_end path, output_path, err
  , report_end.bind(null, path, output_path)


for target in targets when target.compile?
  pattern = translate_pattern(target.pattern)
  matching_paths = all_paths.filter (path) -> pattern.test(path)
  matching_paths.forEach compile.bind null, target
