require ['thumbnails', 'preview'], (thumbnails, preview) ->
  thumbs = document.getElementById 'thumbs'
  photos = document.getElementById 'photos'
  viewer = document.getElementById 'viewer'

  requestAnimationFrame = window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    window.msRequestAnimationFrame or (f) ->
      window.setTimeout f, 1000/60

  window.onscroll = () ->
    if thumbs.offsetTop < ((document.documentElement.scrollTop or document.body.scrollTop) + 20)
      photos.className = 'black' if photos.className isnt 'black'
    else
      photos.className = '' if photos.className isnt ''

  window.onscroll() # Apply for current position

  apply_size = () ->
    img_height = window.innerHeight - 87 + 'px'
    viewer.firstElementChild.firstElementChild.style.height = img_height
    viewer.style.height = img_height
    if photos.className is 'black'
      set_vertical_position thumbs.offsetTop

  window.onresize = apply_size

  set_vertical_position = (y) ->
    document.documentElement.scrollTop = y
    document.body.scrollTop = y

  scroll_to = (target_y) ->
    lapse = 100
    start_y = document.documentElement.scrollTop or document.body.scrollTop
    current_y = start_y
    return if current_y is target_y

    distance = target_y - current_y
    direction = distance / Math.abs distance
    start = new Date().valueOf()

    scroller = () ->
      now = new Date().valueOf()
      progress = (now - start) / 500
      current_y = target_y * progress + start_y * (1 - progress)
      set_vertical_position current_y
      if progress <= 1
        requestAnimationFrame scroller

    scroller()

  thumb_click = (a) -> (event, noscroll) ->
    return if event.button isnt 0
    event.preventDefault()

    scroll_to thumbs.offsetTop if noscroll isnt true

    viewer.innerHTML = preview src: a.href

    apply_size()

    for thumb in thumbs.childNodes
      thumb.className = ''
    a.className = 'active'

  set_actions = () ->
    for a in thumbs.childNodes
      a.onclick = thumb_click a

  window.show_thumbnails = (json) ->
    thumbs.innerHTML = thumbnails photos: json.photos.photo
    set_actions()
    (thumb_click thumbs.childNodes[0]) {button: 0, preventDefault: ->}, true

  call_flickr = () ->
    url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=show_thumbnails&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_sq,url_l"

    api_call = document.createElement 'script'
    api_call.setAttribute 'type', 'text/javascript'
    api_call.setAttribute 'src', url
    document.body.appendChild api_call

  if thumbs.firstElementChild # We are coming back from somewhere
    set_actions()
  else
    call_flickr()
