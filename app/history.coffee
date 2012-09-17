define ['cs!app/util', 'domReady'], (util) ->
  return if not (history.pushState and
                 history.replaceState and
                 window.XMLHttpRequest)

  before_content_mark = '<!--BEFORE CONTENT-->';
  after_content_mark = '<!--AFTER CONTENT-->';
  content_node = document.getElementById 'content';

  initial_state =
    title: document.title
    content: content_node.innerHTML
    classes: document.body.className

  history.replaceState initial_state, initial_state.title, location.href

  window.onpopstate = (event) ->
    if event.state
      apply_state(event.state)
      set_goto_actions()

  apply_state = (state) ->
    document.body.className = state.classes
    document.title = state.title
    content_node.innerHTML = state.content
    null

  load_page = (page_text, href) ->
    try
      state =
        title: page_text.substring(
          page_text.indexOf('<title>') + ('<title>').length,
          page_text.indexOf('</title>'))
        classes: page_text.match(/\<body class\=\"([^\"]+)\"/)[1]
        content: page_text.substring(
          page_text.indexOf(before_content_mark),
          page_text.indexOf(after_content_mark) + after_content_mark.length)

      apply_state(state)
      history.pushState(state, state.title, href)
      set_goto_actions()
    catch error
      location.href = href

  link_click = (a, event) ->
    return if event.button isnt 0
    event.preventDefault()

    request = new XMLHttpRequest();
    request.onreadystatechange = (event) ->
      if request.readyState is 4
        # if (request.status  200) {
        load_page(request.responseText, a.href);

    request.open("GET", a.href, true);
    request.send(null);

  set_goto_actions = () ->
    for a in document.querySelectorAll('a')
      href = a.getAttribute('href')
      if href?.indexOf(':') < 0
        a.onclick = util.partial(link_click, a)

  set_goto_actions: set_goto_actions

