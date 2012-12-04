var szywon;

szywon.photos = {};

(function () {
  'use strict';

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

  var photos = document.getElementById('photos');
  var viewer = document.getElementById('viewer');

  function start () {
    if (viewer.firstElementChild) {
      reposition(); // we are comming back with history api
    } else {
      szywon.jsonp(CALL_URL, CALL_ARGS);
    }
  }

  function receive (data) {
    console.log(data);
  }

  function reposition () {}

  function calc_size (w, h, W, H) {
    var r = w / h;
    var R = W / H;

    return r < R ? {
      w: H * r,
      h: H
    } : {
      w: W,
      h: W / r
    };
  }

  this.start   = start;
  this.receive = receive;
}).call(szywon.photos);
