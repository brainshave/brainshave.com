(function () {
  'strict mode';
  var CANVAS_ID = 'robots';

  ns.show(this, init);

  function init () {
    delete_old_canvas();
    var canvas  = new_canvas();
    var gl      = init_gl(canvas);
    var program = compile_program(gl);

    set_all_locations(gl, program);
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

  function shader_statements (src) {
    return utils.trim(src).split(/;|\n/).map(function (stmt) {
      return stmt.split(/\s+/);
    });
  }

  function by_field (field, value) {
    return function (object) {
      return object[field] === value;
    };
  }

  function set_all_locations (gl, program) {
    var statements =
      shader_statements(get_shader_src('vertex') + '\n' +
                        get_shader_src('fragment'));

    Object.keys(STMT_GETTER_NAMES)
      .forEach(set_locations.bind(null, gl, program, statements));
  }

  var STMT_TYPE_POS = 0;
  var STMT_NAME_POS = 2;
  var STMT_GETTER_NAMES = {
    uniform:   'getUniformLocation',
    attribute: 'getAttribLocation'
  };

  function set_locations (gl, program, statements, type) {
    var stmts = statements.filter(by_field(STMT_TYPE_POS, type));
    var get_location = gl[STMT_GETTER_NAMES[type]].bind(gl);

    var i, name;
    for (i = 0; i < stmts.length; ++i) {
      name = stmts[i][STMT_NAME_POS];
      program[name] = get_location(program, name);
    }
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

  function get_shader_src (id) {
    return document.getElementById(id).innerHTML;
  }

  var SHADER_TYPES = {
    vertex:   'VERTEX_SHADER',
    fragment: 'FRAGMENT_SHADER'
  };

  function compile_shader_from_dom (gl, id) {
    var src  = get_shader_src(id);
    var type = gl[SHADER_TYPES[id]];

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

    return program;
  }
}).call(ns('glinit'));
