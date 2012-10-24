define () ->
  (url) ->
    api_call = document.createElement 'script'
    api_call.setAttribute 'type', 'text/javascript'
    api_call.setAttribute 'src', url
    document.body.appendChild api_call
