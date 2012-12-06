(function () {
  var CALL_URL  = 'http://api.flickr.com/services/rest/';
  var CALL_ARGS = {
    api_key:      'f066b4000caeabf94c09b3dfa0da3a51',
    user_id:      '87386920@N02',
    format:       'json',
    jsoncallback: 'szywon.photos.receive',
    method:       'flickr.people.getPublicPhotos',
    extras:       'url_l,url_c,url_z,url_n,url_m,url_s,url_t',
    per_page:     12
  };

  var STD_BODY_CLASS   = 'dark';
  var PHOTO_BODY_CLASS = 'black';

  var ATTR_PHOTO_ID = 'data-photo-id';
  var ATTR_PHOTO    = 'data-photo';

  var IMG_HEIGHT_RATIO = 0.8;
  var IMG_WIDTH_DELTA  = 32;

  var photos, viewer, photos_cache, get_coords;

  function start () {
    szywon.callbacks.register('onresize', reposition);
    szywon.callbacks.register('onscroll', reposition);

    photos = document.getElementById('photos');
    viewer = document.getElementById('viewer');

    photos_cache = {};
    get_coords   = szywon.size.coords();

    if (viewer.firstElementChild) {
      reposition(); // we are comming back with history api
    } else {
      szywon.jsonp(CALL_URL, CALL_ARGS);
    }
  }

  function receive (data) {
    var div, photo;
    var photos = data.photos.photo;
    for (var i = 0; i < photos.length; ++i) {
      photo = photos[i];

      div = document.createElement('div');
      div.className = 'preview';
      div.setAttribute(ATTR_PHOTO_ID, photo.id);
      div.setAttribute(ATTR_PHOTO,    JSON.stringify(photo));

      viewer.appendChild(div);
    }

    reposition();
  }

  function reposition () {
    var coords = get_coords();
    var visible, unvisible;

    if (coords.size_changed) {
      resize_containers(coords);
    }

    if (coords.scroll_changed) {
      toggle_lights(coords);
    }

    if (coords.size_changed || coords.scroll_changed) {
      visible   = visible_in(coords);
      unvisible = not_in(szywon.utils.children(viewer), visible);

      load_photos(visible);
      unvisible.forEach(unload_photo);
    }
  }

  function toggle_lights (coords) {
    if (viewer.firstElementChild &&
        coords.scroll + coords.height > viewer.offsetTop +
          viewer.firstElementChild.offsetHeight * 0.8) {
      replace_body_class(STD_BODY_CLASS, PHOTO_BODY_CLASS);
    } else {
      replace_body_class(PHOTO_BODY_CLASS, STD_BODY_CLASS);
    }
  }

  function resize_containers (coords) {
    szywon.utils.children(viewer).forEach(function (preview) {
      var photo = photo_info(preview);

      photo.size =
        szywon.size.fit(
          photo.width_l,
          photo.height_l,
          coords.width  - IMG_WIDTH_DELTA,
          coords.height * IMG_HEIGHT_RATIO);

      preview.style.height = photo.size.h + 'px';
    });
  }

  function load_photos (previews) {
    previews.forEach(function (preview) {
      var img;
      var photo = photo_info(preview);

      var old_url = photo.url;
      var url     = photo.url = photo[szywon.size.choose(photo.size.w, photo)];

      if (url !== old_url || !preview.firstElementChild) {
        unload_photo(preview);

        img = document.createElement('img');
        img.setAttribute('src', url);
        preview.appendChild(img);
      } else {
        img = preview.firstElementChild;
      }

      img.style.width  = photo.size.w + 'px';
      img.style.height = photo.size.h + 'px';
    });
  }

  function unload_photo (preview) {
    if (preview.firstElementChild) {
      preview.removeChild(preview.firstElementChild);
    }
  }

  function visible_in (coords) {
    return szywon.utils.children(viewer).filter(function (preview) {
      var top    = coords.scroll > preview.offsetTop - coords.height;
      var bottom = coords.scroll < preview.offsetTop + preview.offsetHeight;
      return top && bottom ? preview : null;
    });
  }

  function photo_info (id_or_element) {
    var photo, id, element;

    if (typeof id_or_element !== 'string') {
      element = id_or_element;
      id = element.getAttribute(ATTR_PHOTO_ID);
    } else {
      id = id_or_element;
    }

    photo = photos_cache[id];

    if (!photo && element) {
      photo = photos_cache[id] = JSON.parse(element.getAttribute(ATTR_PHOTO));
    }

    return photo;
  }

  function replace_body_class (old, neu) {
    document.body.className = document.body.className.replace(old, neu);
  }

  function not_in (all, unwanted) {
    return all.filter(function (element) {
      return unwanted.indexOf(element) === -1;
    });
  }

  this.start   = start;
  this.receive = receive;
}).call(ns('szywon.photos'));
