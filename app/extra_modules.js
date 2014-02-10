ns('szywon.extra_modules', function () {
  "use strict";

  this.start = start;

  var ATTR_EXTRA_SCRIPTS = 'data-extra-scripts';
  var array = use("szywon.utils.array");

  function start () {
    var nodes = array(document.querySelectorAll("[" + ATTR_EXTRA_SCRIPTS + "]"));

    var names = nodes.reduce(function (agg, node) {
      return agg.concat(node.getAttribute(ATTR_EXTRA_SCRIPTS).split(/\s+/));
    }, []);

    names.forEach(function (name) {
      ns(name).start();
    });
  }
});
