ns('tracks', function () {
  'use strict';

  this.fns(create, measure);

  var OUTER = 6;
  var INNER = 8;

  var identity = use('matrices.identity');

  function create (bot) {
    var spread = measure(bot);
    var xl = INNER;
    var zl = 0;

    var right_foot = next_step(xl, zl, INNER, spread.x, spread.z, OUTER, -1);
    var xr = right_foot.x;
    var zr = right_foot.y;
  }

  function measure (bot) {
    var outcome = bot.draw(identity());

    return {
      x: outcome[12],
      y: outcome[13],
      z: outcome[14]
    };
  }

  function next_step (x1, y1, r1, x2, y2, r2, sgn) {
    sgn = sgn || 1;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.sqrt(dx * dx - dy * dy);
    var area = heron(r1, r2, d);
    var h = 2 * area / d;
    var orig_rad = Math.asin(dx / d);
    var extra_rad = Math.asin(h / r1);

    var rad = orig_rad + sgn * extra_rad;

    return {
      x: r1 * Math.cos(rad),
      y: r1 * Math.sin(rad)
    };
  }

  function heron (a, b, c) {
    var p = (a + b + c) / 2;
    return Math.sqrt(p * (p - a) * (p - b) * (p - c));
  }
});
