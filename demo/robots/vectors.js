ns('vectors', function () {
  'use strict';

  function fresh () {
    return new Float32Array([0, 0, 0, 1]);
  }

  function normalize (input, vec) {
    vec = vec || fresh();

    var length = Math.sqrt(input[0] * input[0] +
                           input[1] * input[1] +
                           input[2] * input[2]);

    vec[0] = input[0] / length;
    vec[1] = input[1] / length;
    vec[2] = input[2] / length;
    vec[3] = input[3];

    return vec;
  }
});
