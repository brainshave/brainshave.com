ns('szywon.scripts', function () {
  'use strict';

  this.add = add;

  function extra_scripts () {
    return document.getElementById('extra-scripts');
  }

  function add (url) {
    var api_call = document.createElement('script');
    api_call.setAttribute('type', 'text/javascript');
    api_call.setAttribute('src', url);
    api_call.setAttribute('async', true);
    extra_scripts().appendChild(api_call);
  }
});
