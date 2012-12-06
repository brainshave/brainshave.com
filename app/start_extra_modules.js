(function () {

  var ATTR_EXTRA_SCRIPTS = 'data-extra-scripts';

  function start_extra_modules (content_node) {

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

  this.start_extra_modules = start_extra_modules;

}).call(ns('szywon'));

