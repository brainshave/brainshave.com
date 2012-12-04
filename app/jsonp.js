var szywon;

(function () {
  'use strict';

  function jsonp (url, args) {

    var scripts = document.getElementById('extra-scripts');

    var query = '';

    if (args) {
      var args_arr = [];
      for (var name in args) {
        args_arr.push(name + '=' + args[name]);
      }

      query = '?' + args_arr.join('&');
    }

    var api_call = document.createElement('script');
    api_call.setAttribute('type', 'text/javascript');
    api_call.setAttribute('src', url + query);
    scripts.appendChild(api_call);
  }

  this.jsonp = jsonp;
}).call(szywon);
