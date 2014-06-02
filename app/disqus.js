ns('szywon.disqus', function () {
  'use strict';

  this.start = start;

  var add_script = use('szywon.scripts.add');

  var is_localhost = /^((\d+\.){3}\d+|localhost)$/;

  function start () {
    cleanup();

    if (is_localhost.test(location.hostname)) {
      return;
    }

    var disqus_shortname  = 'longstandingbug';

    window.disqus_shortname  = disqus_shortname;
    window.disqus_url        = "http://www.brainshave.com";
    window.disqus_identifier = location.pathname;

    add_script('http://' + disqus_shortname + '.disqus.com/embed.js');
  }

  function cleanup () {
    window.DISQUS = null;

    var disqus_thread = document.getElementById('disqus_thread');
    disqus_thread.innerHTML = '';
  }
});
