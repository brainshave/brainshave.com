"use strict";

var _ = require("underscore");
var cheerio = require("cheerio");
var filter = require("broccoli-dep-filter");

var SPAN_PAREN_START = '<span class="parenthesis">';
var SPAN_PAREN_END   = '</span>';

module.exports = beauty;

function beauty (trees) {
  return filter({
    trees: trees,
    filter: /\.html$/,
    process: process
  });
}

var all_transforms = _.compose(
  elements,
  quotes('"',      '"',      '“', '”'),
  quotes('&quot;', '&quot;', '“', '”'),
  quotes("'",      "'",      '‘', '’'),
  quotes("&#39;",  "&#39;",  '‘', '’')
);

function process (text) {
  var doc = cheerio.load(text);
  doc("body *").each(function (i, element) {
    if (element.name === "script" || element.name === "code") return;

    var text_nodes = element.children.filter(function (child) {
      return child.type === "text";
    });

    text_nodes.forEach(function (child) {
      child.data = all_transforms(child.data);
    });

    parenthesis(text_nodes);
  });

  return doc.html();
}


function elements (src) {
  return (
    src
      .replace(/\.{3}/g, '…')
      .replace(/-{3}/g, '—')
      .replace(/tl;?dr:?/ig, '<span class="tldr">tl<span class="only-in-feed">;</span> dr<span class="only-in-feed">:</span></span>')
      .replace(/([^&][^a-z]+)(\;|\:)-?(\(|\)|P|D)/g, '$1<span class="emot">$2$3</span>')
      .replace(/\%\[(.?([^%\[])*)\]\%/g, '<span class="key">$1</span>')
  );
}


function parenthesis (text_nodes) {
  var parens = _.chain(text_nodes).map(function (node, node_index) {
    return find_all(node.data, "(").map(function (index) {
      return {
        node: node_index,
        pos:  index,
        left: true
      }
    }).concat(find_all(node.data, ")").map(function (index) {
      return {
        node: node_index,
        pos:  index,
        right: true
      }
    }));
  }).flatten().sort(function (a, b) {
    var node_diff = a.node - b.node;
    if (node_diff) return node_diff;
    return a.pos - b.pos;
  }).value();

  // give each paren depth in the stack number
  parens.reduce(function (depth, paren) {
    return paren.depth = (paren.left
                          ? Math.max(1, depth + 1)
                          : depth - 1);
  }, 0);

  // only top-level is of interest to us
  var top = parens.filter(function (paren) {
    if (paren.left) return paren.depth === 1;
    if (paren.right) return paren.depth === 0;
  });

  // get rid of unbalanced left paren
  top.length = top.length - (top.length % 2);

  var offsets = [];

  top.forEach(function (paren) {
    var offset = offsets[paren.node] || 0;
    var node = text_nodes[paren.node];
    var text = node.data;

    if (paren.left) {
      text =
        text.substr(0, paren.pos + offset) +
        SPAN_PAREN_START +
        text.substr(paren.pos + offset);
      offset += SPAN_PAREN_START.length;
    } else {
      text = text.substr(0, paren.pos + offset + 1) +
        SPAN_PAREN_END +
        text.substr(paren.pos + offset + 1);
      offset += SPAN_PAREN_END.length;
    }

    offsets[paren.node] = offset;
    node.data = text;
  });
}

function find_all (str, sub) {
  var all = [];

  for (var i = str.indexOf(sub, 0);
       i >= 0;
       i = str.indexOf(sub, i + 1)) {
    var prev = str[i - 1];

    if (prev !== ":" && prev !== ";") {
      all.push(i);
    }
  }

  return all;
}

function global_regexp (str) {
  return new RegExp(str, 'g');
}

function quotes (open, close, open_subs, close_subs) {
  var after_word      = global_regexp('(\\b|[+\\-!~])' + close);
  var after_word_subs = '$1' + close_subs;

  var before_space      = global_regexp(close + '(\\s)');
  var before_space_subs = close_subs + '$1';

  var all_to_open      = global_regexp(open);
  var all_to_open_subs = open_subs;

  return function (src) {
    return (src
            .replace(after_word,   after_word_subs)
            .replace(before_space, before_space_subs)
            .replace(all_to_open,  all_to_open_subs));
  };
}
