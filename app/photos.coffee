require ['thumbnails'], (thumbnails) ->
  photos = document.getElementById 'photos'

  url = "http://api.flickr.com/services/rest/?api_key=f066b4000caeabf94c09b3dfa0da3a51&format=json&jsoncallback=show_thumbnails&method=flickr.people.getPublicPhotos&user_id=87386920@N02&extras=url_q,url_l"

  api_call = document.createElement 'script'
  api_call.setAttribute 'type', 'text/javascript'
  api_call.setAttribute 'src', url

  document.body.appendChild api_call

  window.show_thumbnails = (json) ->
    console.log json
    photos.innerHTML = thumbnails photos: json.photos.photo
