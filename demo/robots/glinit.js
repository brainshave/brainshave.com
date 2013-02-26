(function () {
  'strict mode';
  var CANVAS_ID = 'robots';

  this.init = init;

  function init () {
    delete_old_canvas();
    var canvas  = new_canvas();
    var gl      = init_gl(canvas);
    var program = compile_program(gl);
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

  function compile_shader (gl, type, src)  {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  function compile_shader_from_dom (gl, id) {
    var src = document.getElementById(id).innerHTML;
    var type =
      id == 'vertex'   ? gl.VERTEX_SHADER   :
      id == 'fragment' ? gl.FRAGMENT_SHADER :
                         0;

    return compile_shader(gl, type, src);
  }

  function compile_program (gl) {
    var vertex   = compile_shader_from_dom(gl, 'vertex');
    var fragment = compile_shader_from_dom(gl, 'fragment');

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);

    gl.linkProgram(program);
    gl.useProgram(program);
  }
}).call(ns('robots.glinit'));
