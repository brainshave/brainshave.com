require [], () ->
  photos = document.getElementById 'photos'
  viewer = document.getElementById 'viewer'

  requestAnimationFrame = window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    window.msRequestAnimationFrame or (f) ->
      window.setTimeout f, 1000/60

  calc_size = (w, h, W, H) ->
    r = w / h
    R = W / H
    if r < R
      [H * r, H]
    else
      [W, W / r]

  current_position = () ->
    document.documentElement.scrollTop or document.body.scrollTop

  reposition = () ->
    viewer_height = window.innerHeight - 200
    viewer_width  = window.innerWidth - 32
    position = current_position()

    if position + window.innerHeight * 0.2 > photos.offsetTop
      document.body.className = document.body.className.replace 'dark', 'black'
    else
      document.body.className = document.body.className.replace 'black', 'dark'

    for div in viewer.children
      photo = JSON.parse div.getAttribute 'data-photo'
      [x, y] = calc_size +photo.width_l, +photo.height_l, viewer_width, viewer_height
      div.style.backgroundSize = "#{x}px #{y}px"
      div.style.height = "#{y}px"
      if div.children.length is 0
        if div.offsetTop < position + (window.innerHeight * 1.1)
          img = document.createElement 'img'
          img.src = photo.url_l
          img.style.width = "#{x}px"
          img.style.height = "#{y}px"
          img.onload = ((div, img) -> (e) ->
            if div.children.length is 0 then div.appendChild img) div, img
      else
        div.firstElementChild.style.width  = "#{x}px"
        div.firstElementChild.style.height = "#{y}px"

  window.onresize = reposition
  window.onscroll = reposition

  window.load_lowres = (json) ->
    for photo in json.photos.photo
      div = document.createElement 'div'
      div.className = 'preview'
      div.style.backgroundImage = "url(#{photo.url_t})"
      div.setAttribute 'data-photo', JSON.stringify photo

      viewer.appendChild div

    reposition()

  call_flickr = () ->
    url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=load_lowres&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_sq,url_l,url_c,url_z,url_n,url_m,url_s,url_t&per_page=12"

    api_call = document.createElement 'script'
    api_call.setAttribute 'type', 'text/javascript'
    api_call.setAttribute 'src', url
    document.body.appendChild api_call

  if viewer.firstElementChild # We are coming back from somewhere
    reposition()
  else
    call_flickr()
