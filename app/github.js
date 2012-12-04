var szywon;

szywon.github = {};

(function () {
  'use strict';

  var DATA_LOADED = 'data-github-loaded';

  var CALL_URL = 'https://api.github.com/users/szywon/repos';

  //?callback=github.receive&per_page=5&sort=pushed&order=desc
  var CALL_ARGS = {
    callback: 'szywon.github.receive',
    sort:     'pushed',
    order:    'desc',
    per_page: 5
  };

  var FIRST_LETTER = /^\w/;
  var LAST_DOT     = /\.$/;

  var list = document.getElementById('github');

  function start() {
    if (!list.getAttribute(DATA_LOADED)) {
      szywon.jsonp(CALL_URL, CALL_ARGS);
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

    list.innerHTML = szywon.github_list(json);
  }

  this.receive = receive;
  this.start   = start;
}).call(szywon.github);
