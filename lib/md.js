var marked = require('marked');
var beauty = require('./beauty');

function md (text) {
  var tokens = marked.lexer(text);

  tokens.forEach(function (token) {
    if (token.type !== 'code' && token.text) {
      token.text = beauty.html(beauty.md(token.text));
    }
  });

  return marked.parser(tokens);
}

module.exports = md;
