ns('animation', function () {
  'use strict';

  this.fns(start, stop);

  function start (gl, program) {
    set_view(gl, program);

    var cube = elements.cube(gl, program);
    cube.draw(gl, gl.LINES);

    console.log(gl.getError());
  }

  function stop (gl, program) {
  }

  function set_view (gl, program) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform4f(program.color, 1, 1, 1, 1);
    gl.uniformMatrix4fv(program.p,  false, matrices.frustum(20, 10, -10, 10));
    gl.uniformMatrix4fv(program.mv, false, matrices.identity());
  }


});
