ns('elements', function () {
  'use strict';

  var init_buffer  = use('buffers.init_buffer');
  var init_indices = use('buffers.init_indices');

  this.cube = element(3, [
   -0.5,  0.5,  0.5,
   -0.5, -0.5,  0.5,
    0.5,  0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5, -0.5,
    0.5, -0.5, -0.5,
   -0.5,  0.5, -0.5,
   -0.5, -0.5, -0.5
  ], [
    0, 1, 2, 3, 4, 5, 6, 7,
    0, 2, 1, 3, 4, 6, 5, 7,
    0, 6, 2, 4, 3, 5, 1, 7
  ]);


  this.circle = element(3, (new Array(10)).map(function (element, index, array) {
    return [Math.cos(index / array.length), 0, Math.sin(index / array.length)];
  }).reduce(function (mem, triple) {
    return mem.concat(triple);
  }, []));

  function element (item_size, verts, indices, default_mode) {
    return function (gl, program) {
      var verts_buffer =  init_buffer(gl, verts, item_size);

      var indices_buffer;
      if (indices) {
        indices_buffer = init_indices(gl, indices);
      }

      var draw_fn = draw(gl, program, verts_buffer, indices_buffer, default_mode);

      return draw_fn;
    };
  }

  function draw (gl, program, verts_buffer, indices_buffer, default_mode) {
    default_mode = default_mode || gl.LINES;

    return function (mode) {
      mode = mode || default_mode;

      gl.bindBuffer(gl.ARRAY_BUFFER, verts_buffer);
      gl.vertexAttribPointer(program.pos, verts_buffer.item_size, gl.FLOAT, false, 0, 0);

      if (indices_buffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
        gl.drawElements(mode, indices_buffer.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(mode, 0, verts_buffer.length);
      }
    }
  }
});
