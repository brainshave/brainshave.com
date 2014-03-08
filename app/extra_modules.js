ns("szywon.extra_modules", function () {
  "use strict";

  this.start = start;

  var ATTR_EXTRA_SCRIPTS = "data-extra-scripts";
  var EXTRA_SCRIPTS_SELECTOR = "[" + ATTR_EXTRA_SCRIPTS + "]";
  var array = use("szywon.utils.array");

  function start () {
    var nodes;

    if (document.querySelectorAll) {
      nodes = array(document.querySelectorAll(EXTRA_SCRIPTS_SELECTOR));
    } else {
      nodes = Sizzle(EXTRA_SCRIPTS_SELECTOR);
    }

    var names = nodes.reduce(function (agg, node) {
      return agg.concat(node.getAttribute(ATTR_EXTRA_SCRIPTS).split(/\s+/));
    }, []);

    names.forEach(function (name) {
      ns(name).start();
    });
  }
});
