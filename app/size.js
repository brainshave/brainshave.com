(function () {
  var WIDTH_PREFIX    = 'width_';
  var URL_PREFIX      = 'url_';
  var SIZE_NAME_INDEX = WIDTH_PREFIX.length;
  var PIXEL_RATIO     = window.devicePixelRatio || 1;


  function coords () {
    var old_width  = Infinity;
    var old_height = Infinity;
    var old_scroll = Infinity;

    return function () {
      var width  = document.documentElement.clientWidth;
      var height = window.innerHeight;
      var scroll = window.scrollY ||
        document.documentElement.scrollTop || document.body.scrollTop;

      var value = {
        width:  width,
        height: height,
        scroll: scroll,

        scroll_changed: scroll !== old_scroll,
        size_changed:   width !== old_width || height !== old_height
      };

      old_width  = width;
      old_height = height;
      old_scroll = scroll;

      return value;
    };
  }

  function choose (w, photo) {
    var d = Infinity, size = 's', new_d, new_w;

    w *= PIXEL_RATIO;

    for (var name in photo) {
      if (name.indexOf(WIDTH_PREFIX) === 0) {
        new_w = +photo[name];
        new_d = Math.abs(new_w - w);
        if (new_d < d) {
          size = name[SIZE_NAME_INDEX];
          d    = new_d;
        }
      }
    }
    return URL_PREFIX + size;
  }

  function fit (w, h, W, H) {
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

  this.fit    = fit;
  this.coords = coords;
  this.choose = choose;
}).call(ns('szywon.size'));
