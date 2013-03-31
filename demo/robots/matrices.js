/*

A simple matrix function library, taken from my other project, superbigle.

In every function the `mat` parameter will hold the result but it's optional and
will be created automatically if not passed. Use it when you want to avoid
memory allocation.

*/

ns('matrices', function () {
  'use strict';

  this.fns(zero, identity, diagonal, frustum, multiply, scale, translate,
           rotate_x, rotate_y, rotate_z, switcher);

  function zero (mat) {
    if (mat) {
      for (var i = 0; i < 16; ++i) {
        mat[i] = 0;
      }
      return mat;
    } else {
      return new Float32Array(16);
    }
  }

  function copy (source, mat) {
    mat = zero(mat);

    mat.set(source);

    return mat;
  }

  function identity (mat) {
    return diagonal(1, mat);
  }

  function diagonal (value, mat) {
    mat = zero(mat);

    mat[0]  = value;
    mat[5]  = value;
    mat[10] = value;
    mat[15] = value;

    return mat;
  }

  /**
     Simple Frustum function. Eye position is in (0,0,0), both near
     and far must be positive. Eye is looking straight along the Z
     axis. To get a different eye positions or different angles you
     need to translate/rotate the matrix respectively.
  */
  function frustum (width, height, near, far, mat) {
    mat = zero(mat);

    if (near <= 0) {
      throw new RangeError('Near plane must be > 0.');
    }

    if (far <= near) {
      throw new RangeError('Far plane must be > near plane.');
    }

    mat[0]  = 2 * near / width;
    mat[5]  = 2 * near / height;
    mat[10] = (far + near) / (far - near);
    mat[11] = 1;
    mat[14] = (-2 * far * near) / (far - near);

    return mat;
  }

  function multiply (a, b, mat) {
    mat = mat || new Float32Array(16);

    var i, j, k = 0;

    for (i = 0; i < 16; ++i) {
      j = i % 4;

      mat[i] =
        a[j]      * b[k]     +
        a[j + 4]  * b[k + 1] +
        a[j + 8]  * b[k + 2] +
        a[j + 12] * b[k + 3];

      // after a column:
      if (j === 3) {
        k += 4;
      }
    }

    return mat;
  }

  function scale (x, y, z, mat) {
    mat = identity(mat);

    mat[0]  *= x;
    mat[5]  *= y;
    mat[10] *= z;

    return mat;
  }

  function translate (x, y, z, mat) {
    mat = identity(mat);

    mat[12] += x;
    mat[13] += y;
    mat[14] += z;

    return mat;
  }

  function rotate_x (rad, mat) {
    mat = identity(mat);

    var sin = Math.sin(rad);
    var cos = Math.cos(rad);

    mat[5]  =  cos;
    mat[6]  = -sin;
    mat[9]  =  sin;
    mat[10] =  cos;

    return mat;
  }

  function rotate_y (rad, mat) {
    mat = identity(mat);

    var sin = Math.sin(rad);
    var cos = Math.cos(rad);

    mat[0]  =  cos;
    mat[2]  =  sin;
    mat[8]  = -sin;
    mat[10] =  cos;

    return mat;
  }

  function rotate_z (rad, mat) {
    mat = identity(mat);

    var sin = Math.sin(rad);
    var cos = Math.cos(rad);

    mat[0] =  cos;
    mat[1] = -sin;
    mat[4] =  sin;
    mat[5] =  cos;

    return mat;
  }


  /**
     Switcher between two matrices. Useful when you want to reuse the
     old value of one matrix to calculate value of the second one, and
     then use the second one to calculate value of the first one (and
     avoid allocation for each calculation.

     Example (rotating):

     var mv = matrices.switcher();
     var angle = matrices.rotate_x(Math.PI/100);

     // then in the loop:

     matrices.multiply(mv.current(), angle, mv.switch());
     gl.uniformMatrix4fv(program.mv, false, mv.current());

     gl.clear(...)
     gl.draw...(...)

   */
  function switcher () {
    var one = matrices.identity();
    var two = matrices.identity();

    var use_one = true;

    return {
      switch: function () {
        use_one = !use_one;
        return use_one ? one : two;
      },
      current: function () {
        return use_one ? one : two;
      }
    };
  }
});
