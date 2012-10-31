require ['jsonp'], (jsonp) ->
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

  width_prefix    = 'width_'
  url_prefix      = 'url_'
  size_name_index = width_prefix.length
  pixel_ratio     = window.devicePixelRatio or 1

  choose_size = (w, photo) ->
    d = Infinity
    size = 's'
    w *= pixel_ratio
    for own prop, width of photo when (prop.indexOf width_prefix) is 0
      new_d = Math.abs +width - w
      if new_d < d
        d    = new_d
        size = prop[size_name_index]
    return size

  current_position = () ->
    document.documentElement.scrollTop or document.body.scrollTop

  loading_imgs = {}

  img_onload = (div, img, url, width, height) ->
    cancel = false
    fn = (e) ->
      return if cancel
      div.removeChild div.firstElementChild if div.firstElementChild
      img.style.width  = "#{fn.width}px"
      img.style.height = "#{fn.height}px"
      div.appendChild img
    fn.cancel = () ->
      cancel = true
    fn.url    = url
    fn.width  = width
    fn.height = height
    fn

  reposition = () ->
    viewer_height = window.innerHeight * 0.8
    viewer_width  = document.documentElement.clientWidth - 32
    position = current_position()

    first_photo_h = viewer.firstElementChild?.clientHeight
    if first_photo_h and position + window.innerHeight > photos.offsetTop + first_photo_h
      document.body.className = document.body.className.replace 'dark', 'black'
    else
      document.body.className = document.body.className.replace 'black', 'dark'

    for div in viewer.children
      photo   = JSON.parse div.getAttribute 'data-photo'
      current = loading_imgs[photo.id]

      [w, h] = calc_size +photo.width_l, +photo.height_l, viewer_width, viewer_height
      div.style.backgroundSize = "#{w}px #{h}px"
      current?.width  = w
      current?.height = h
      div.style.height = "#{h}px"
      url = photo["#{url_prefix}#{choose_size w, photo}"]

      replace = false
      if div.firstElementChild
        img = div.firstElementChild
        img.style.width  = "#{w}px"
        img.style.height = "#{h}px"
        current_url = current?.url or img.getAttribute 'src'
        replace = current_url isnt url
        div.style.backgroundImage = "url(#{current_url})" if replace

      if (replace or not div.firstElementChild) and (div.offsetTop < position + (window.innerHeight * 1.5))
        current.cancel() if current
        img = document.createElement 'img'
        loading_imgs[photo.id] = img.onload = img_onload div, img, url, w, h
        img.src = url
    return

  window.onresize = reposition
  window.onscroll = reposition

  window.load_lowres = (json) ->
    for photo in json.photos.photo
      div = document.createElement 'div'
      div.className = 'preview'
      div.setAttribute 'data-photo', JSON.stringify photo

      viewer.appendChild div

    reposition()

  if viewer.firstElementChild # We are coming back from somewhere
    reposition()
  else
    jsonp("http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=load_lowres&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_l,url_c,url_z,url_n,url_m,url_s,url_t&per_page=12")
