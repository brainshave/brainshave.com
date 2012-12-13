module.exports = {
  md:   md,
  html: html
};

function md (src) {
  return src.replace(/([^=])"(\w)/g, '$1“$2')
    .replace(/(\w)'/g, '$1’')
    .replace(/'(\w)/g, '‘$1')
    .replace(/(\w)"(?! ?(([\/>])|([:a-z]+=)))/g, '$1”')
    .replace(/\.{3}/g, '…')
    .replace(/-{3}/g, '—')
    .replace(/\^(\w+)/g, '<sup>$1</sup>');
}

var SPAN_PAREN_START = '<span class="parenthesis">';
var SPAN_PAREN_END   = '</span>';

function html (src) {
  var open   = -1;
  var stack  = -1;
  var link   = false;
  var ranges = {};

  var next_open, next_close;

  var cursor = src.indexOf('(');

  while (cursor >= 0) {
    if (src[cursor] === '(') {
      if (src[cursor - 1] === ']') {
        link = true;
      } else {
        stack++;
        if (stack === 0) {
          open = cursor;
        }
      }
    } else {
      if (link) {
        link = false;
      } else {
        stack = Math.max(stack - 1, -1);
        if (stack < 0) {
          ranges[open] = cursor + 1;
        }
      }
    }

    cursor++;
    next_open  = src.indexOf('(', cursor);
    next_close = src.indexOf(')', cursor);

    cursor = next_open > 0 && next_open < next_close ?
      next_open : next_close;
  }

  var padding = 0;
  var start, end;
  for (var index in ranges) {
    start = +index + padding;
    end   = ranges[index] + padding;

    src =
      src.substring(0, start) +
      SPAN_PAREN_START +
      src.substring(start, end) +
      SPAN_PAREN_END +
      src.substring(end);

    padding += SPAN_PAREN_START.length + SPAN_PAREN_END.length;
  }

  return src;
}
