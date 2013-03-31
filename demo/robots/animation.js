ns('animation', function () {
  'use strict';

  this.fns(start, stop);

  function start (gl, program) {
    set_view(gl, program);

    var bot = window.bot.create(gl, program);

    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame;

    var mv = matrices.switcher();

    var angle = matrices.rotate_y(Math.PI/100);

    step();

    function step () {
      matrices.multiply(mv.current(), angle, mv.switch());
      //gl.uniformMatrix4fv(program.mv, false, mv.current());

      draw();

      requestAnimationFrame(step);
    }

    function draw () {
      gl.clear(gl.COLOR_BUFFER_BIT);
      bot(mv.current());
    }
  }

  function stop (gl, program) {
  }

  function set_view (gl, program) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 1);

    var size = near_plane_size(16, 9, gl.drawingBufferWidth, gl.drawingBufferHeight);

    var p = matrices.multiply(matrices.frustum(size.w, size.h, 10, 500),
                              matrices.translate(0, -4, 20));

    gl.uniform4f(program.color, 1, 1, 1, 1);
    gl.uniformMatrix4fv(program.p,  false, p);
  }

  /**
     Takes the desired view size (in OpenGL world units) and viewport
     size. Returns size of the view (again in the OpenGL units)
     outgrown in one direction so whole view is visible and original
     proportions are kept. (useful for frustum function)
  */
  function near_plane_size (w, h, W, H) {
    var r = w / h;
    var R = W / H;

    return r > R ? {
      w: h,
      h: h / R
    } : {
      w: w * R,
      h: w
    };
  }
});
