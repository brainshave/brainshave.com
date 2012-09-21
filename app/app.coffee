require.config baseUrl: '/app'

require ['history'], (history) ->
  history.set_goto_actions()
