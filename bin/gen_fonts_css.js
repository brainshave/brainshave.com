#!/usr/bin/env node

var fs = require('fs');

var code = fs.readFileSync('fonts/fonts.css', 'utf8');

var inlined = code.replace(/url\(\/?([^\)]+)\)/g, function (match, path) {
  var font = fs.readFileSync(path, { encoding: 'base64' });
  return 'url(data:application/font-woff;base64,' + font + ')';
});

fs.writeFileSync('fonts/fonts_inlined.css', inlined, 'utf8');
