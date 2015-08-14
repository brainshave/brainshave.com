ns("szywon.fonts", function () {
  "use strict";

  this.start = start;

  var fonts_path = "/fonts/fonts.css";
  var inlined_fonts_path = "/fonts/fonts_inlined.css";

  function start () {
    if (!window.localStorage) {
      inject_link(fonts_path);
      return;
    }

    var needs_downloading = !localStorage.getItem(inlined_fonts_path);

    if (needs_downloading) {
      download(inlined_fonts_path, function (styles) {
        inject_style(styles);
        try {
          localStorage.setItem(inlined_fonts_path, styles)
        } catch (e) {}
      });
    }
  }

  function download (path, cb) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        cb(xhr.responseText);
      }
    }

    xhr.open("GET", path, true);
    xhr.send();
  }

  function inject_style (text) {
    var style;

    if (document.createStyleSheet) {
      // IE
      style = document.createStyleSheet();
      style.cssText = text;
    } else {
      style = document.createElement("style");
      style.innerHTML = text;
      document.head.appendChild(style);
    }
  }

  function inject_link (href) {
    var link = document.createElement("link");

    link.href = href;
    link.rel = "stylesheet";
    link.type = "text/css";

    document.head.appendChild(link);
  }
});
