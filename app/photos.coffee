require ['thumbnails', 'preview'], (thumbnails, preview) ->
  url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=show_thumbnails&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_sq,url_l"

  api_call = document.createElement 'script'
  api_call.setAttribute 'type', 'text/javascript'
  api_call.setAttribute 'src', url

  requestAnimationFrame = window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.msRequestAnimationFrame

  toggle_gallery = (photos, offset) -> (event) ->
    if offset < ((document.documentElement.scrollTop or document.body.scrollTop) + 20)
      photos.className = 'active' if photos.className isnt 'active'
    else
      photos.className = '' if photos.className isnt ''

  scroll_to = (target_y) ->
    lapse = 500
    start_y = document.documentElement.scrollTop or document.body.scrollTop
    current_y = start_y
    return if current_y is target_y

    if not requestAnimationFrame
      document.documentElement.scrollTop = target_y;
      document.body.scrollTop = target_y;
      return

    distance = target_y - current_y
    direction = distance / Math.abs distance
    start = new Date().valueOf()

    scroller = () ->
      now = new Date().valueOf()
      progress = (now - start) / 500
      current_y = target_y * progress + start_y * (1 - progress)
      document.documentElement.scrollTop = current_y;
      document.body.scrollTop = current_y;
      if progress <= 1
        requestAnimationFrame scroller

    scroller()

  thumb_click = (photos, thumbs, viewer, a) -> (event, noscroll) ->
    return if event.button isnt 0
    event.preventDefault()

    img_height = window.innerHeight - 87 + 'px'
    viewer.style.height = img_height

    window.onscroll = toggle_gallery photos, thumbs.offsetTop

    scroll_to thumbs.offsetTop if noscroll isnt true

    viewer.innerHTML = preview src: a.href, height: img_height
    for thumb in thumbs.childNodes
      thumb.className = ''
    a.className = 'active'

  window.show_thumbnails = (json) ->
    thumbs = document.getElementById 'thumbs'
    photos = document.getElementById 'photos'
    viewer = document.getElementById 'viewer'
    thumbs.innerHTML = thumbnails photos: json.photos.photo
    for a in thumbs.childNodes
      a.onclick = thumb_click photos, thumbs, viewer, a
    thumbs.childNodes[0].onclick {button: 0, preventDefault: ->}, true

  document.body.appendChild api_call