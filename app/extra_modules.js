ns('szywon.extra_modules', function () {
  this.start = start;

  var ATTR_EXTRA_SCRIPTS = 'data-extra-scripts';

  function start (content_node) {

    if (!(content_node.firstElementChild)) return;

    var names =
      content_node.firstElementChild.getAttribute(ATTR_EXTRA_SCRIPTS);

    if (!names) return;

    names.split(/\s+/).forEach(function (name) {
      if (name) {
        ns(name).start();
      }
    });
  }
});

