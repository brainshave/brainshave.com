ns('elements', function () {
  'use strict';

  this.cube = element(3, [
   -1,  1,  1,
   -1, -1,  1,
    1,  1,  1,
    1, -1,  1,
    1,  1, -1,
    1, -1, -1,
   -1,  1, -1,
   -1, -1, -1
  ], [
    0, 1, 2, 3, 4, 5, 6, 7,
    0, 2, 1, 3, 4, 6, 5, 7,
    0, 6, 2, 4, 3, 5, 1, 7
  ]);

  function element (item_size, verts, indices) {
    return function (gl, program) {
      var el = { buffer: buffers.init_buffer(gl, verts, item_size) };

      if (indices) {
        el.indices = buffers.init_indices(gl, indices);
      }

      el.draw = draw(gl, program, el);

      return el;
    };
  }

  function draw (gl, program, element) {
    return function (mode) {
      gl.bindBuffer(gl.ARRAY_BUFFER, element.buffer);
      gl.vertexAttribPointer(program.pos, element.buffer.item_size, gl.FLOAT, false, 0, 0);

      if (element.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, element.indices);
        gl.drawElements(mode, element.indices.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(mode, 0, elment.buffer.length);
      }
    }
  }


});
