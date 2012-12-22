(function () {

  var BEFORE_TITLE   = '<title>';
  var AFTER_TITLE    = '</title>';
  var BEFORE_CONTENT = '<!--BEFORE CONTENT-->';
  var AFTER_CONTENT  = '<!--AFTER CONTENT-->';
  var BODY_CLASSES   = /<body class\=\"([^\"]+)\"/;

  var content_element, extra_scripts;

  function start() {
    var history_supported = window.XMLHttpRequest && window.history &&
      window.history.pushState && window.history.replaceState;

    if (!history_supported) return;

    szywon.callbacks.register('onpopstate', restore_state, true);

    content_element = document.getElementById('content');
    extra_scripts   = document.getElementById('extra-scripts');

    update_links();
  }

  function restore_state (event) {
    if (!event.state) return;

    apply_state(event.state);
    update_links();
  }

  function update_links () {
    var links = szywon.utils.array(document.getElementsByTagName('a'));

    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.indexOf(':') < 0) {
        a.onclick = click.bind(null, a);
      }
    });
  }

  function click (a, event) {
    if (event.button !== 0) return;
    event.preventDefault();

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        load_page(request.responseText, a.href);
      }
    };

    request.open('GET', a.href, true);
    request.send(null);
  }

  function load_page (text, href) {
    var state;

    try {
      state = {
        title:   text_between(text, BEFORE_TITLE,   AFTER_TITLE),
        content: text_between(text, BEFORE_CONTENT, AFTER_CONTENT),
        classes: text.match(BODY_CLASSES)[1]
      };

      save_current_state();
      history.pushState(state, state.title, href);
      apply_state(state);

      document.documentElement.scrollTop = 0;
      document.body.scrollTop            = 0;

    } catch (error) {
      console.log(error.stack || error);
      window.location.href = href;
    }
  }

  function apply_state (state) {
    szywon.callbacks.reset();
    szywon.scripts.clear();

    document.title            = szywon.utils.unescape(state.title);
    document.body.className   = state.classes;
    content_element.innerHTML = state.content;

    update_links();
    szywon.start_extra_modules(content_element);
  }

  function save_current_state () {
    var state = {
      title:   document.title,
      classes: document.body.className,
      content: content_element.innerHTML
    };

    window.history.replaceState(state, state.title, window.location.href);
  }

  function text_between (text, mark_start, mark_end) {
    return text.substring(
      text.indexOf(mark_start) + mark_start.length,
      text.indexOf(mark_end));
  }

  this.start = start;

}).call(ns('szywon.history'));
