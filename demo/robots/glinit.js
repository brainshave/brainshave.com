(function () {
  'use strict';
  var CANVAS_ID = 'robots';

  ns.show(this, init);

  function init () {
    delete_old_canvas();
    var canvas  = new_canvas();
    var gl      = init_gl(canvas);
    var program = compile_program(gl);

    shaders.set_all_locations(gl, program);
    console.log(gl, program);
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
    var vertex   = shaders.compile_from_dom(gl, 'vertex');
    var fragment = shaders.compile_from_dom(gl, 'fragment');

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
  }
}).call(ns('glinit'));
