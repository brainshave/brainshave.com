ns('glinit', function () {
  'use strict';

  this.fns(init);

  var set_all_locations = use('shaders.set_all_locations');
  var compile_from_dom  = use('shaders.compile_from_dom');
  var start = use('animation.start');


  var CANVAS_ID = 'robots';
  var PIXEL_RATIO = window.devicePixelRatio || 1;

  function init () {
    delete_old_canvas();
    var canvas  = new_canvas();
    var gl      = init_gl(canvas);
    var program = compile_program(gl);

    set_all_locations(gl, program);
    gl.enableVertexAttribArray(program.pos);

    start(gl, program);
  }

  function new_canvas () {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id',     CANVAS_ID);
    canvas.setAttribute('width',  window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    document.body.appendChild(canvas);
    return canvas;
  }

  function delete_old_canvas () {
    var canvas = document.getElementById(CANVAS_ID);
    if (canvas) {
      canvas.parentElement.removeChild(canvas);
    }
  }

  function init_gl (canvas) {
    var gl = canvas.getContext('experimental-webgl');
    if (!gl) {
      document.body.innerHTML = 'No WebGLOL support :(';
    }
    return gl;
  }

  function compile_program (gl) {
    var vertex   = compile_from_dom(gl, 'vertex');
    var fragment = compile_from_dom(gl, 'fragment');

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
  }
});
