define () -> (content) ->
  script_names = content.firstElementChild?.getAttribute 'data-extra-scripts'
  extra_scripts = document.getElementById 'extra-scripts'
  if script_names?.length
    script = document.createElement 'script'
    script.setAttribute 'type', 'text/javascript'
    scripts = script_names.split /\s+/
    script.innerText = "require(#{JSON.stringify scripts},function(#{scripts.join ','}){#{(scripts.map (name) -> name + '();').join('')}});"
    extra_scripts.appendChild script
