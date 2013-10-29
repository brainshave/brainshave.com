ns('szywon.github', function () {
  'use strict';

  this.fns(start);

  var jsonp       = use('szywon.scripts.jsonp');
  var callback    = use('szywon.scripts.callback');
  var github_list = use('szywon.templates.github.list');

  var DATA_LOADED = 'data-github-loaded';

  var OMMITTED_PROJECTS = [
    'szywon.github.com',
    'dotfiles',
    'oh-my-zsh'
  ];

  var CALL_URL  = 'https://api.github.com/users/szywon/repos';

  var MORE_SENTENCES = /\.\s.*/;
  var LAST_DOT       = /\.$/;

  var list;

  function start() {
    list = document.getElementById('github');

    if (!list.getAttribute(DATA_LOADED)) {
      jsonp(CALL_URL, {
        callback: callback(receive),
        sort:     'pushed',
        order:    'desc',
        per_page: 4 + OMMITTED_PROJECTS.length
      });
    }
  }

  function receive (json) {
    if (!(json && json.data && json.data.length)) {
      return;
    }

    list.setAttribute(DATA_LOADED, true);

    json.data = json.data.filter(function (project) {
      return OMMITTED_PROJECTS.indexOf(project.name) === -1;
    }).map(function (project) {
      project.description = project.description
        .replace(MORE_SENTENCES, '')
        .replace(LAST_DOT, '');

      return project;
    });

    list.innerHTML = github_list(json);
  }
});
