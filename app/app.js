main(function() {
  'use strict';

  var start_extra_modules = use('szywon.extra_modules.start');
  var start_history       = use('szywon.history.start');

  start_extra_modules(document.getElementById('content'));
});
