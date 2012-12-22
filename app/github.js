(function () {
  'use strict';

  var DATA_LOADED = 'data-github-loaded';

  var CALL_URL  = 'https://api.github.com/users/szywon/repos';
  var CALL_ARGS = {
    callback: 'szywon.github.receive',
    sort:     'pushed',
    order:    'desc',
    per_page: 5
  };

  var FIRST_LETTER = /^\w/;
  var LAST_DOT     = /\.$/;

  var list;

  function start() {
    list = document.getElementById('github');

    if (!list.getAttribute(DATA_LOADED)) {
      szywon.scripts.jsonp(CALL_URL, CALL_ARGS);
    }
  }

  function receive (json) {
    if (!(json && json.data && json.data.length)) {
      return;
    }

    list.setAttribute(DATA_LOADED, true);

    json.data = json.data.filter(function (project) {
      return project.name !== 'szywon.github.com';
    }).map(function (project) {
      project.description = project.description
        .replace(FIRST_LETTER, function (x) {
          return x.toLowerCase();
        }).replace(LAST_DOT, '');

      return project;
    });

    list.innerHTML = szywon.templates.github.list(json);
  }

  this.receive = receive;
  this.start   = start;
}).call(ns('szywon.github'));
