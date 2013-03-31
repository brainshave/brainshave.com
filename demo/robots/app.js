main(function () {
  window.onresize = glinit.init;

  window.onclick = function () {
    fullscreen.toggle(document.documentElement);
  }

  glinit.init();
});
