ns("szywon.fix_svg_pos", function () {
  "use strict";

  /*
    This fixes SVG alignment in FF and IE which are positioning
    elements with sub-pixel precision. That's nice but means blurry
    pictures.
   */

  this.start = start;

  function start () {
    if (!document.querySelectorAll) return;

    var svgs = document.querySelectorAll("svg");
    for (var i = 0; i < svgs.length; ++i) {
      fix(svgs[i]);
    }
  }

  function fix (el) {
    var pos = el.getScreenCTM();
    if (!pos)  return;

    var dx = -(pos.e % 1);
    var dy = -(pos.f % 1);

    el.style.position = "relative";
    el.style.left = dx + "px";
    el.style.top = dy + "px";
  }
});
