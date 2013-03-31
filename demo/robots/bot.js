ns('bot', function () {
  'use strict';

  this.fns(create);

  function create (gl, program) {
    var mv = matrices.switcher();
    var cube = elements.cube(gl, program);

    var cube_size_forward = matrices.translate(0, 0, 2);

    var feet_size = matrices.scale(0.3, 0.3, 1);
    var to_feet_joint = matrices.translate(0, 0, 0.2);
    var ankle_rotate = matrices.rotate_x(Math.PI * 5 / 8);

    var to_shin_centre = matrices.translate(0, 0, 1.35);
    var to_leg_part_centre = matrices.translate(0, 0, 1.15);
    var leg_part_size = matrices.scale(0.3, 0.3, 2);

    var knee_rotate = matrices.rotate_x(- Math.PI * 2 / 8);

    var to_leg_head_joint = matrices.translate(0, 0, 0.85);
    var leg_unrotate = matrices.rotate_x(Math.PI / 8);
    var head_size = matrices.scale(1.5, 1.5, 1.5);
    var to_head_centre = matrices.translate(0.95, 0, 0);

    function set_mv () {
      gl.uniformMatrix4fv(program.mv, false, mv.current());
    }

    function op (other) {
      matrices.multiply(mv.current(), other, mv.switch());
    }

    return function draw (start_mv) {
      mv.current().set(start_mv);

      op(feet_size);
      set_mv();
      cube();

      mv.switch(); // undo size
      op(to_feet_joint);
      op(ankle_rotate);
      op(to_shin_centre);
      op(leg_part_size);
      set_mv();
      cube();

      mv.switch();
      op(to_leg_part_centre);
      op(knee_rotate);
      op(to_leg_part_centre);
      op(leg_part_size);
      set_mv();
      cube();

      mv.switch();
      op(to_leg_head_joint);
      op(leg_unrotate);
      op(to_head_centre);
      op(head_size);
      set_mv();
      cube();

    };
  }
});
