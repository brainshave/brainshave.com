(function () {

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

  function clear () {
    extra_scripts().innerHTML = '';
  }

  function query_str (args) {
    var query = '';

    if (args) {
      var args_arr = [];
      for (var name in args) {
        args_arr.push(name + '=' + args[name]);
      }

      query = '?' + args_arr.join('&');
    }

    return query;
  }

  function jsonp (url, args) {
    add(url + query_str(args));
  }

  this.add       = add;
  this.clear     = clear;
  this.jsonp     = jsonp;
  this.query_str = query_str;

}).call(ns('szywon.scripts'));