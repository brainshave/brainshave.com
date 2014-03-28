ns("szywon.szow", function () {
  "use strict";

  this.fns(start);

  var NEXT_CODES = [32, 34, 39, 40];
  var PREV_CODES = [33, 37, 38];

  var array = use("szywon.utils.array");

  var html = document.documentElement;
  var fullscreen = html.mozRequestFullScreen || html.webkitRequestFullScreen;

  var sections = [];

  function start () {
    var content = document.body;

    if (window.addEventListener) {
      window.addEventListener("keydown", keyboard, false);
    }

    sections = [];
    var elements = array(content.children);

    elements.forEach(function (element) {
      var name = element.nodeName;

      var section = sections[sections.length - 1];
      var section_content;

      if (!section || name === "H1" || name === "HR") {
        section = document.createElement("section");
        sections.push(section);
        section_content = document.createElement("div");
        section_content.className = "wrap";
        section.appendChild(section_content);
      }

      section_content = section.children[0];

      if (element.nodeName === "HR") {
        content.removeChild(element);
      } else if (name !== "SCRIPT") {
        section_content.appendChild(element);
      }
    });

    sections.forEach(function (section) {
      content.appendChild(section);
    });
  }

  function keyboard (event) {
    var dir = (NEXT_CODES.indexOf(event.keyCode) > -1
               ? 1
               : PREV_CODES.indexOf(event.keyCode) > -1
               ? -1
               : 0);

    if (event.keyCode === 70) { // 'f'
      fullscreen.call(html);
    }

    if (dir) {
      move(dir);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function move (dir) {
    var scroll = html.scrollTop || document.body.scrollTop;
    var height = window.innerHeight;

    var i = Math.round(scroll / height) + dir;

    if (sections[i]) {
      window.scrollTo(0, sections[i].offsetTop);
    }
  }
});
