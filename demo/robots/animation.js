ns('animation', function () {
  'use strict';

  this.fns(start, stop);

  function start (gl, program) {
    set_view(gl, program);

    var cube = elements.cube(gl, program);

    var mv = matrices.switcher();

    var angle = matrices.rotate_x(Math.PI/100);

    step();

    function step () {
      matrices.multiply(mv.current(), angle, mv.switch());
      gl.uniformMatrix4fv(program.mv, false, mv.current());

      gl.clear(gl.COLOR_BUFFER_BIT);
      cube.draw(gl.LINES);

      requestAnimationFrame(step);
    }
  }

  function stop (gl, program) {
  }

  function set_view (gl, program) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 1);

    var p =  matrices.multiply(matrices.frustum(5, 5, 3, 500),
                               matrices.translate(0, 0, 6));

    gl.uniform4f(program.color, 1, 1, 1, 1);
    gl.uniformMatrix4fv(program.p,  false, p);
  }
});
