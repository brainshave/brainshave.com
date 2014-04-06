"use strict";

var _ = require("underscore");
var cheerio = require("cheerio");
var Filter = require("broccoli-filter");

module.exports = BeautyFilter;

BeautyFilter.prototype = new Filter();
BeautyFilter.prototype.processString   = beauty;
BeautyFilter.prototype.extensions      = ["html"];
BeautyFilter.prototype.targetExtension =  "html";

function BeautyFilter (tree, options) {
  // OOo… :-(
  if (!(this instanceof BeautyFilter)) {
    return new BeautyFilter(tree, options);
  }

  Filter.call(this, tree, options);
}

var double_quotes = brackets('&quot;', '&quot;', '“', '”');
var single_quotes = brackets("'", "'", '‘', '’');

var all_transforms = _.compose(
  //single_quotes,
  double_quotes,
  elements,
  parenthesis
);

function beauty (text) {
  var doc = cheerio.load(text);
  doc("*").each(function (i, element) {
    if (element.name === "script" || element.name === "code") return;
    element.children = element.children.map(function (child) {
      if (child.type === "text") {
        child.data = all_transforms(child.data);
      }
      return child;
    });
  });

  return doc.html();
}

function global_regexp (str) {
  return new RegExp(str, 'g');
}

function brackets (open, close, open_subs, close_subs) {
  var after_word      = global_regexp('(\\b)' + close);
  var after_word_subs = close_subs;

  var before_space      = global_regexp(close + '(\\s)');
  var before_space_subs = close_subs + '$1';

  var all_to_open      = global_regexp(open);
  var all_to_open_subs = open_subs;

  var params = global_regexp(
    '\\=[' + open + open_subs + ']' +
    '([^' + open + close + open_subs + close_subs + ']+)' +
    '[' + close + close_subs + ']');
  var params_subs = '=' + open + '$1' + close;

  return function (src) {
    return (src
            .replace(after_word,   after_word_subs)
            .replace(before_space, before_space_subs)
            .replace(all_to_open,  all_to_open_subs)
            .replace(params,       params_subs));
  };
}

function elements (src) {
  return (
    src.replace(/\.{3}/g, '…')
      .replace(/-{3}/g, '—')
      .replace(/tl;?dr:?/ig, '<span class="tldr">tl<span class="only-in-feed">;</span> dr<span class="only-in-feed">:</span></span>')
      .replace(/([^&][^a-z]+)(\;|\:)-?(\(|\)|P)/g, '$1<span class="emot">$2$3</span>')
  );
}

var SPAN_PAREN_START = '<span class="parenthesis">';
var SPAN_PAREN_END   = '</span>';

function parenthesis (src) {
  var open   = -1;
  var stack  = -1;
  var link   = false;
  var ranges = {};

  var next_open, next_close;

  var cursor = src.indexOf('(');

  while (cursor >= 0) {
    if (src[cursor] === '(') {
      stack++;
      if (stack === 0) {
        open = cursor;
      }
    } else {
      if (!(/;|:/.test(src[cursor - 1]))) {
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
