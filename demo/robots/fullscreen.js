ns('fullscreen', function () {
  'use strict';

  this.fns(toggle);

  var togglers = [
    toggle_compat(),
    toggle_compat('moz', 'S'),
    toggle_compat('webkit', 's', 'S', 's')
  ];

  function toggle (element) {
    togglers.forEach(function (toggler) { toggler(element); });
  }

  function toggle_compat (prefix, request_s, cancel_s, elem_s) {
    prefix = prefix || '';

    request_s = request_s || 's';
    cancel_s  =  cancel_s || request_s;
    elem_s    =    elem_s || cancel_s;

    var request_full_screen =
      lower_first_letter(prefix + 'RequestFull' + request_s + 'creen');
    var cancel_full_screen =
      lower_first_letter(prefix + 'CancelFull' + cancel_s + 'creen');
    var full_screen_element =
      lower_first_letter(prefix + 'Full' + elem_s + 'creenElement');

    if (document[cancel_full_screen]) {
      return function (element) {
        if (document[full_screen_element]) {
          document[cancel_full_screen]();
          return true;
        } else if (element[request_full_screen]) {
          element[request_full_screen]();
          return true;
        }
      };
    } else {
      return function () {};
    }
  }

  function lower_first_letter (str) {
    return str.replace(/^./, function (s) { return s.toLowerCase(); });
  }
});
