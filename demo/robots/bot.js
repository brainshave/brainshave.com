ns('bot', function () {
  'use strict';

  this.fns(create);

  function create (gl, program) {
    var mv = matrices.switcher();
    var cube = elements.cube(gl, program);

    var invert_x = matrices.scale(-1, 1, 1);

    var cube_size_forward = matrices.translate(0, 0, 2);

    var feet_size = matrices.scale(0.3, 0.3, 1);
    var to_feet_joint = matrices.translate(0, 0, 0.2);

    var to_shin_centre = matrices.translate(0, 0, 1.35);
    var to_leg_part_centre = matrices.translate(0, 0, 1.15);
    var leg_part_size = matrices.scale(0.3, 0.3, 2);

    var to_leg_head_joint = matrices.translate(0, 0, 0.85);

    var to_head_centre = matrices.translate(1, 0, 0);
    var head_size = matrices.scale(1.5, 1.5, 1.5);

    var right_ankle_rotate = matrices.rotate_x(Math.PI * 5 / 8);
    var right_knee_rotate = matrices.rotate_x(- Math.PI * 2 / 8);
    var right_leg_unrotate = matrices.rotate_x(Math.PI * 5 / 8);

    var left_leg_rotate = matrices.rotate_x(Math.PI * 3 / 8);
    var left_knee_rotate = matrices.rotate_x(Math.PI * 2 / 8);
    var left_ankle_rotate = matrices.rotate_x(- Math.PI * 5 / 8);

    function set_mv () {
      gl.uniformMatrix4fv(program.mv, false, mv.current());
    }

    function op (other) {
      matrices.multiply(mv.current(), other, mv.switch());
    }

    function series () {
      mv.switch();
      for (var i = 0; i < arguments.length; ++i) {
        op(arguments[i]);
      }
      set_mv();
      cube();
    }

    return function draw (start_mv) {
      mv.current().set(start_mv);

      // centering preview.
      op(invert_x);
      op(to_head_centre);
      op(invert_x);

      op(feet_size);
      set_mv();
      cube();

      series(
        to_feet_joint,
        right_ankle_rotate,
        to_shin_centre,
        leg_part_size);

      series(
        to_leg_part_centre,
        right_knee_rotate,
        to_leg_part_centre,
        leg_part_size);

      series(
        to_leg_head_joint,
        right_leg_unrotate,
        to_head_centre,
        head_size);

      series(
        to_head_centre,
        left_leg_rotate,
        to_leg_head_joint,
        leg_part_size);

      series(
        to_leg_part_centre,
        left_knee_rotate,
        to_leg_part_centre,
        leg_part_size);

      series(
        to_shin_centre,
        left_ankle_rotate,
        to_feet_joint,
        feet_size);
    };
  }
});
