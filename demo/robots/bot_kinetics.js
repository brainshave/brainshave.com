ns('bot.kinetics', function () {
  'use strict';

  this.fns(animator);

  var sequence = [
    [90, -60, 90, 60],
    [120, 0, 30, 60],
    [150, -60, 30, 60]
  ].map(function (moment) { return moment.map(deg_to_rad); });

  var key_frames_count = sequence.length;

  function animator (angles) {
    var first_ankle  = angles.first_ankle;
    var first_knee   = angles.first_knee;
    var body         = angles.body;
    var second_leg   = angles.second_leg;
    var second_knee  = angles.second_knee;
    var second_ankle = angles.second_ankle;

    var rotate_x = matrices.rotate_x;

    return set_progress;

    function set_progress (progress) {
      var moment = moment_at(progress);

      rotate_x(moment[0], first_ankle);
      rotate_x(moment[1], first_knee);
      rotate_x(Math.PI - moment[0] - moment[1], body);
      rotate_x(moment[2], second_leg);
      rotate_x(moment[3], second_knee);
      rotate_x(- moment[2] - moment[3], second_ankle);
    }
  }

  function moment_at (progress) {
    var cursor = key_frames_count * progress;
    var first_frame_index = Math.floor(cursor);
    var first_frame_amount = 1 - (cursor - first_frame_index);
    var second_frame_amount = 1 - first_frame_amount;

    var second_frame_index = first_frame_index + 1;

    if (second_frame_index >= sequence.length) {
      second_frame_index = 0;
    }

    var first_frame = sequence[first_frame_index];
    var second_frame = sequence[second_frame_index];

    var new_moment = [];

    for (var i = 0; i < 4; ++i) {
      new_moment[i] = first_frame[i] * first_frame_amount + second_frame[i] * second_frame_amount;
    }

    return new_moment;
  }

  function deg_to_rad (deg) {
    return Math.PI * (deg / 180);
  }
});
