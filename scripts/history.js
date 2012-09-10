(function () {
  if (!(history.pushState && history.replaceState && window.XMLHttpRequest)) {
    return;
  }

  var before_content_mark = "<!-- BEFORE CONTENT-->";
  var after_content_mark = "<!-- AFTER CONTENT-->";
  var content_node = document.getElementById('content');

  var initial_state = {
    title: document.title,
    content: content_node.innerHTML,
    classes: document.body.className
  };

  history.replaceState(initial_state, initial_state.title, location.href);

  window.onpopstate = function (event) {
    var state = event.state;

    if (state) {
      document.body.className = state.classes;
      document.title = state.title;
      content_node.innerHTML = state.content;
      set_goto_actions();
    }
  };

  var load_page = function(page_text, href) {
    var title = page_text.substring(page_text.indexOf('<title>') + ('<title>').length,
      page_text.indexOf('</title>'));
    var classes = page_text.match(/\<body class\=\"([^\"]+)\"/)[1];
    var content = page_text.substring(page_text.indexOf(before_content_mark),
      page_text.indexOf(after_content_mark) + (after_content_mark).length);

    document.body.className = classes;
    document.title = title;
    content_node.innerHTML = content;

    history.pushState({
      content: content,
      classes: classes,
      title: title
    }, title, href);

    set_goto_actions();
  };

  var set_goto_actions = function() {
    var i, a, as = document.querySelectorAll('a');
    for (i = 0; i < as.length; ++i) {
      a = as[i];
      var href = a.getAttribute('href');
      if (href && href.indexOf(':') < 0) {
        a.onclick = (function (a) {
          return function (event) {
            event = event || window.event;
            if (event.button !== 0) {
              return;
            }
            event.preventDefault();

            var request = new XMLHttpRequest();
            request.onreadystatechange = function (event) {
              if (request.readyState === 4) {
                if (request.status === 200) {
                  load_page(request.responseText, a.href);
                } else {
                  location.href = a.href; // navigate
                }
              }
            };
            request.open("GET", a.href, true);
            request.send(null);
          };
        })(a);
      }
    }
  };

  set_goto_actions();
})();
