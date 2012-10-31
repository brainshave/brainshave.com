define () ->
  scripts = document.getElementById('extra-scripts')
  (url) ->
    api_call = document.createElement 'script'
    api_call.setAttribute 'type', 'text/javascript'
    api_call.setAttribute 'src', url
    scripts.appendChild api_call
