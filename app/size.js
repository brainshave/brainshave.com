(function () {
  var WIDTH_PREFIX    = 'width_';
  var URL_PREFIX      = 'url_';
  var SIZE_NAME_INDEX = WIDTH_PREFIX.length;
  var PIXEL_RATIO     = window.devicePixelRatio || 1;

  var old_W  = Infinity;
  var old_H  = Infinity;
  var old_scroll = Infinity;

  function coords () {
    var scroll = document.documentElement.scrollTop || document.body.scrollTop;
    var W      = document.documentElement.clientWidth - 32;
    var H      = window.innerHeight * 0.8;

    var value = {
      scroll: scroll,
      W:      W,
      H:      H,

      scroll_changed: scroll !== Math.abs(scroll - old_scroll) > H / 10,
      size_changed:   W !== old_W || H !== old_H
    };

    old_scroll = scroll;
    old_W      = W;
    old_H      = H;

    return value;
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
