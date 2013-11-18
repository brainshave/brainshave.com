main(function () {
  var init_gl = use('glinit.init');

  window.onresize = init_gl();

  window.onclick = function () {
    //fullscreen.toggle(document.documentElement);
  }

  init_gl();
});
