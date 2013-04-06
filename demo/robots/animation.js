ns('animation', function () {
  'use strict';

  this.fns(start, stop);

  function start (gl, program) {
    set_view(gl, program);

    var bot = window.bot.create(gl, program);
    var set_progress = window.bot.kinetics.animator(bot.angles);

    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame;

    var mv = matrices.switcher();
    matrices.multiply(matrices.translate(-8, 0, 0),
                      matrices.rotate_y(Math.PI / 2),
                      mv.current());

    var angle = matrices.rotate_y(Math.PI/100);
    var invert = matrices.scale(-1, -1, -1);

    var start_time = (new Date()).getTime();
    var term  = 1000;

    var bot_second_foot_pos;
    var old_progress = 0;

    step();

    function step () {
      //matrices.multiply(mv.current(), angle, mv.switch());

      set_positions();
      draw();

      requestAnimationFrame(step);
    }

    function set_positions () {
      var progress = (((new Date()).getTime() - start_time) % term) / term;
      set_progress(progress);

      if (progress < old_progress) {
        // Start drawing from the other foot
        // rotation is in all directions:
        // x - because we want to invert legs
        // y & z - because after drawing the second foot the matrix is
        // inverted in those directions (the first foot is drawn with
        // z directing to back of the robot, the second is drawn with
        // z directing to the front of the robot)
        matrices.multiply(bot_second_foot_pos, invert, mv.current());
      }

      old_progress = progress;
    }

    function draw () {
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Saving the matrix that holds position of the second foot
      // because on switch we use it as a starting point.
      bot_second_foot_pos = bot.draw(mv.current());
    }
  }

  function stop (gl, program) {
  }

  function set_view (gl, program) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 1);

    var size = near_plane_size(16, 9, gl.drawingBufferWidth, gl.drawingBufferHeight);

    var p = matrices.multiply(matrices.frustum(size.w, size.h, 10, 500),
                              matrices.translate(0, -2.5, 20));

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
