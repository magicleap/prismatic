/**
 * @function wiggle
 * @summary Wiggle effect on a node. Use transform rotateBy.
 */
let wiggle = (el, axes = [0, 1, 0]) => {
  /**
   * Check transform exists.
   */
  if (!el._transform) return;

  /**
   * Wiggle
   */
  el._transform.rotateBy(new Float32Array(axes), 0.07, 0.1, 0);
  el._transform.rotateBy(new Float32Array(axes), -0.07, 0.1, 0);
  el._transform.rotateBy(new Float32Array(axes), -0.07, 0.1, 0);
  el._transform.rotateBy(new Float32Array(axes), 0.07, 0.1, 0);
};

export { wiggle }
