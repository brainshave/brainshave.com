define ['reset_callbacks'], (reset_callbacks) ->
  if not (history.pushState and history.replaceState and window.XMLHttpRequest)
    return

  before_content = '<!--BEFORE CONTENT-->'
  after_content  = '<!--AFTER CONTENT-->'

  before_scripts = '<!--BEFORE SCRIPTS-->'
  after_scripts  = '<!--AFTER SCRIPTS-->'

  content_node  = document.getElementById 'content'
  extra_scripts = document.getElementById 'extra-scripts'

  reset_callbacks = reset_callbacks ['onpopstate']

  get_srcs = (text) ->
    srcs = text.match /src="[^"]+/gi
    if srcs
      (src.match /[^"]+/g)[1] for src in srcs
    else
      []

  window.onpopstate = (event) ->
    if event.state
      apply_state(event.state)
      set_goto_actions()

  apply_state = (state) ->
    document.title          = state.title
    document.body.className = state.classes
    content_node.innerHTML  = state.content

    # Remove all extra scripts
    while extra_scripts.firstElementChild
      extra_scripts.removeChild extra_scripts.firstElementChild

    # Add new scripts
    for src in state.scripts
      script = document.createElement 'script'
      script.setAttribute 'type', 'text/javascript'
      script.setAttribute 'src', src
      extra_scripts.appendChild script

  save_current_state = () ->
    state =
      title:   document.title
      classes: document.body.className
      content: content_node.innerHTML
      scripts: get_srcs extra_scripts.innerHTML

    reset_callbacks()

    history.replaceState state, state.title, location.href

  text_between_marks = (text, mark_start, mark_end) ->
    (text.substring text.indexOf(mark_start),
                    (text.indexOf mark_end) + mark_end.length)

  load_page = (page_text, href) ->
    try
      state =
        title: page_text.substring(
          page_text.indexOf('<title>') + ('<title>').length,
          page_text.indexOf('</title>'))
        classes: page_text.match(/\<body class\=\"([^\"]+)\"/)[1]
        content: (text_between_marks page_text, before_content, after_content)
        scripts: get_srcs (text_between_marks page_text, before_scripts, after_scripts)

      save_current_state()
      history.pushState state, state.title, href
      apply_state state
      set_goto_actions()
    catch error
      location.href = href

  link_click = (a, event) ->
    return if event.button isnt 0
    event.preventDefault()

    request = new XMLHttpRequest
    request.onreadystatechange = (event) ->
      if request.readyState is 4
        load_page(request.responseText, a.href)

    request.open("GET", a.href, true)
    request.send(null)

  set_goto_actions = () ->
    for a in document.getElementsByTagName('a')
      href = a.getAttribute('href')
      if href?.indexOf(':') < 0
        a.onclick = link_click.bind null, a

  set_goto_actions()
