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

function html (src) {
  return src.replace(
    /([^\]])\(([^\n)]+)\)/g,
    '$1<span class="parenthesis">($2)</span>');
}
