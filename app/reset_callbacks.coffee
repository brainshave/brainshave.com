define () ->
  (omit) ->
    names = []
    for name of window
      if (name.indexOf 'on') is 0 and (omit.indexOf name) is -1
        names.push name

    () -> window[name] = null for name in names
