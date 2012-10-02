require ['thumbnails', 'preview'], (thumbnails, preview) ->
  url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=show_thumbnails&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_q,url_l"

  api_call = document.createElement 'script'
  api_call.setAttribute 'type', 'text/javascript'
  api_call.setAttribute 'src', url

  document.body.appendChild api_call

  thumb_click = (photos, thumbs, viewer, a) -> (event) ->
    event.preventDefault()
    photos.className = 'active'
    viewer.innerHTML = preview src: a.href

  window.show_thumbnails = (json) ->
    console.log json
    thumbs = document.getElementById 'thumbs'
    photos = document.getElementById 'photos'
    viewer = document.getElementById 'viewer'
    thumbs.innerHTML = thumbnails photos: json.photos.photo
    for a in thumbs.childNodes
      a.onclick = thumb_click photos, thumbs, viewer, a
