(function () {

  var scripts = document.getElementById('extra-scripts');

  function load_scripts (paths) {
    if (!paths.length) return;

    var path = paths.shift();

    var script = document.createElement('script');

    script.onload = load_scripts.bind(null, paths);

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', path);
    scripts.appendChild(script);
  }

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState < 4) return;

    if (xhr.status !== 200) {
      console.log('XHR error');
      console.log(xhr);
      return;
    }

    load_scripts(JSON.parse(xhr.response).sources);
  };

  xhr.open('GET', '/app.map.json');
  xhr.send();

})();
