ns('bot', function () {
  'use strict';

  this.fns(create);

  var FOOT_LENGTH = 1;
  var LEG_PART_LENGTH = 2;
  var LEG_PART_SIZE = 0.3;

  var LEG_HALFSIZE = 1.35;

  function create (gl, program) {
    var mv = matrices.switcher();
    var cube = elements.cube(gl, program);

    var cube_size_forward  = matrices.translate(0, 0, 2);

    var feet_size          = matrices.scale(0.3, 0.3, 1);
    var to_feet_joint      = matrices.translate(0, 0, 0.2);

    var to_shin_centre     = matrices.translate(0, 0, 1.35);
    var to_leg_part_centre = matrices.translate(0, 0, 1.15);
    var leg_part_size      = matrices.scale(0.3, 0.3, 2);
    var leg_half_length    = matrices.translate(0, 0, LEG_HALFSIZE);

    var to_leg_head_joint  = matrices.translate(0, 0, 0.85);

    var to_head_centre     = matrices.translate(1, 0, 0);
    var head_size          = matrices.scale(1.5, 1.5, 1.5);

    var first_ankle_rotate = matrices.rotate_x(Math.PI * 5 / 8);
    var first_knee_rotate = matrices.rotate_x(- Math.PI * 2 / 8);
    var first_leg_unrotate = matrices.rotate_x(Math.PI * 5 / 8);

    var second_leg_rotate = matrices.rotate_x(Math.PI * 3 / 8);
    var second_knee_rotate = matrices.rotate_x(Math.PI * 2 / 8);
    var second_ankle_rotate = matrices.rotate_x(- Math.PI * 5 / 8);

    var switch_sides = matrices.identity();

    function op (other) {
      matrices.multiply(mv.current(), other, mv.switch());
    }

    function series (/* mat1, mat2, ..., mat_scale */) {
      for (var i = 0; i < arguments.length; ++i) {
        op(arguments[i]);
      }

      gl.uniformMatrix4fv(program.mv, false, mv.current());
      cube();

      mv.switch(); // revert last operation which is scale
    }

    return {
      draw: draw,
      angles: {
        first_ankle:  first_ankle_rotate,
        first_knee:   first_knee_rotate,
        body:         first_leg_unrotate,
        second_leg:   second_leg_rotate,
        second_knee:  second_knee_rotate,
        second_ankle: second_ankle_rotate
      }
    };

    function set_angles () {}

    function draw (start_mv) {
      mv.current().set(start_mv);

      series(feet_size);

      series(
        to_feet_joint,
        first_ankle_rotate,
        leg_half_length,
        leg_part_size);

      series(
        leg_half_length,
        first_knee_rotate,
        leg_half_length,
        leg_part_size);

      series(
        leg_half_length,
        first_leg_unrotate,
        to_head_centre,
        head_size);

      series(
        to_head_centre,
        second_leg_rotate,
        leg_half_length,
        leg_part_size);

      series(
        leg_half_length,
        second_knee_rotate,
        leg_half_length,
        leg_part_size);

      series(
        leg_half_length,
        second_ankle_rotate,
        to_feet_joint,
        feet_size);

      return mv.current();
    };
  }
});
