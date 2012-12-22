(function () {

  function start () {
    cleanup();

    var disqus_shortname  = 'szywon';

    window.disqus_shortname  = disqus_shortname;
    window.disqus_url        = location.url;
    window.disqus_identifier = location.pathname;

    szywon.scripts.add('http://' + disqus_shortname + '.disqus.com/embed.js');
  }

  function cleanup () {
    window.DISQUS = null;

    var disqus_thread = document.getElementById('disqus_thread');
    disqus_thread.innerHTML = '';
  }

  this.start = start;

}).call(ns('szywon.disqus'));
