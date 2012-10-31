require.config baseUrl: '/app'

require ['history', 'load_extra_scripts'], (history, load_extra_scripts) ->
  load_extra_scripts document.getElementById 'content'
