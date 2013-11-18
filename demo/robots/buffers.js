ns('buffers', function () {
  'use strict';

  this.fns(init);

  this.init_buffer = init(WebGLRenderingContext.ARRAY_BUFFER, Float32Array);
  this.init_indices = init(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, Uint16Array);

  function init (type, array_ctor) {
    return function (gl, verts, item_size) {
      var buff = gl.createBuffer();

      item_size = item_size || 1;
      buff.item_size = item_size;
      buff.length = Math.floor(verts.length / item_size);

      gl.bindBuffer(type, buff);
      gl.bufferData(type, new array_ctor(verts), gl.STATIC_DRAW);

      return buff;
    };
  }
});
