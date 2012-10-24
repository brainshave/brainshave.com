require ['underscore', 'jsonp', 'github_list'], (_, jsonp, github_list) ->
  list = document.getElementById 'github'

  window.load_github = (json) ->
    return if not json?.data?.length > 0

    list.setAttribute 'data-github-loaded', true

    json.data = _(json.data)
      .filter((project) -> project.name isnt 'szywon.github.com')
      .map((project) ->
        project.description = project.description
          .replace(/^\w/, (x) -> x.toLowerCase())
          .replace(/\.$/, '')
        project)

    list.innerHTML = github_list json


  if not list.getAttribute 'data-github-loaded'
    jsonp 'https://api.github.com/users/szywon/repos?callback=load_github&sort=pushed&order=desc'
