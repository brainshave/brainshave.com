ns('buffers', function () {
  'use strict';

  this.fns(init);

  var ARRAY_CTORS = {};
  ARRAY_CTORS[WebGLRenderingContext.ARRAY_BUFFER] = Float32Array;
  ARRAY_CTORS[WebGLRenderingContext.ELEMENT_ARRAY_BUFFER] = Uint16Array;

  this.init_buffer = init(WebGLRenderingContext.ARRAY_BUFFER);
  this.init_indices = init(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);

  function init (type) {
    var array_ctor = ARRAY_CTORS[type];

    return function (gl, verts, item_size) {
      var buff = gl.createBuffer();

      item_size = item_size || 1;
      buff.item_size = item_size;
      buff.length = Math.floor(verts / item_size);

      gl.bindBuffer(type, buff);
      gl.bufferData(type, new array_ctor(verts), gl.STATIC_DRAW);

      return buff;
    };
  }
});
