require ['thumbnails', 'preview'], (thumbnails, preview) ->
  # thumbs = document.getElementById 'thumbs'
  photos = document.getElementById 'photos'
  viewer = document.getElementById 'viewer'

  requestAnimationFrame = window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    window.msRequestAnimationFrame or (f) ->
      window.setTimeout f, 1000/60

  window.onscroll = () ->
    position = document.documentElement.scrollTop or document.body.scrollTop
    if photos.offsetTop < position + 100
      document.body.className = document.body.className.replace 'dark', 'black' if document.body.className.indexOf('dark') > -1
    else
      document.body.className = document.body.className.replace 'black', 'dark' if document.body.className.indexOf('black') > -1

    viewer_height = window.innerHeight - 200
    viewer_width = window.innerWidth - 32

    for div in viewer.children
      if div.children.length is 0 and div.offsetTop < position + (window.innerHeight * 1.1)
        photo = JSON.parse div.getAttribute 'data-photo'
        [x, y] = calc_size +photo.width_l, +photo.height_l, viewer_width, viewer_height
        margin = (viewer_height - y) / 2
        img = document.createElement 'img'
        img.src = photo.url_l
        img.style.width = "#{x}px"
        img.style.height = "#{y}px"
        div.appendChild img

  window.onscroll() # Apply for current position

  calc_size = (w, h, W, H) ->
    r = w / h
    R = W / H
    if r < R
      [H * r, H]
    else
      [W, W / r]

  apply_size = () ->
    viewer_height = window.innerHeight - 200
    viewer_width = window.innerWidth - 32

    for div in viewer.children
      photo = JSON.parse div.getAttribute 'data-photo'
      [x, y] = calc_size +photo.width_l, +photo.height_l, viewer_width, viewer_height
      div.style.backgroundSize = "#{x}px #{y}px"
      div.style.height = "#{y}px"
      div.firstElementChild?.style.width = "#{x}px"
      div.firstElementChild?.style.height = "#{y}px"

    viewer.style.minHeight = viewer_height + 'px'
    # if photos.className is 'black'
    #   set_vertical_position thumbs.offsetTop

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

    # scroll_to thumbs.offsetTop if noscroll isnt true

    # viewer.innerHTML = preview src: a.href

    apply_size()

    for thumb in thumbs.children
      thumb.className = ''
    a.className = 'active'

  # set_actions = () ->
  #   for a in thumbs.children
  #     a.onclick = thumb_click a

  window.show_thumbnails = (json) ->
    # thumbs.innerHTML = thumbnails photos: json.photos.photo
    # set_actions()
    # (thumb_click thumbs.childNodes[0]) {button: 0, preventDefault: ->}, true
    html = ""
    for photo in json.photos.photo
      html += preview photo: photo, src: photo.url_l
    viewer.innerHTML = html
    apply_size()

  call_flickr = () ->
    url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=show_thumbnails&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_sq,url_l,url_c,url_z,url_n,url_m,url_s,url_t"

    api_call = document.createElement 'script'
    api_call.setAttribute 'type', 'text/javascript'
    api_call.setAttribute 'src', url
    document.body.appendChild api_call

  if viewer.firstElementChild # We are coming back from somewhere
    set_actions()
  else
    call_flickr()
