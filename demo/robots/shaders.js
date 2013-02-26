(function () {
  'use strict';

  ns.show(this, compile, compile_from_dom, set_all_locations);

  var SHADER_TYPES = {
    vertex:   'VERTEX_SHADER',
    fragment: 'FRAGMENT_SHADER'
  };

  var STMT_TYPE_POS = 0;
  var STMT_NAME_POS = 2;
  var STMT_GETTER_NAMES = {
    uniform:   'getUniformLocation',
    attribute: 'getAttribLocation'
  };

  function set_all_locations (gl, program) {
    var statements =
      utils.statements(src_from_dom('vertex') + '\n' +
                       src_from_dom('fragment'));

    Object.keys(STMT_GETTER_NAMES)
      .forEach(set_locations.bind(null, gl, program, statements));
  }


  function set_locations (gl, program, statements, type) {
    var stmts = statements.filter(utils.by_field(STMT_TYPE_POS, type));
    var get_location = gl[STMT_GETTER_NAMES[type]].bind(gl);

    var i, name;
    for (i = 0; i < stmts.length; ++i) {
      name = stmts[i][STMT_NAME_POS];
      program[name] = get_location(program, name);
    }
  }

  function compile (gl, type, src)  {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  function src_from_dom (id) {
    return document.getElementById(id).innerHTML;
  }

  function compile_from_dom (gl, id) {
    var src  = src_from_dom(id);
    var type = gl[SHADER_TYPES[id]];

    return compile(gl, type, src);
  }
}).call(ns('shaders'));
