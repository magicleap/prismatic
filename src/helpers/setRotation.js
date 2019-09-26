import { parseRotation } from '../utilities/parseRotation.js';
import { angleToQuaternion } from '../utilities/angleToQuaternion.js';

/**
 * The rotation attribute value is parsed and set a quaternion.
 * @param {HTMLElement} el HTML custom element.
 * @param {string} rotation Rotation attribute value.
 */
let setRotation = (el, rotation) => {
  /**
   * Parse rotation attribute values and map to quaternions.
   */
  if (rotation) {
    let rotationQuaternionArr = angleToQuaternion(parseRotation(rotation));
    if (rotationQuaternionArr && el._transform) {
      el._transform.setLocalRotation(new Float32Array(rotationQuaternionArr));
    }
  }
};

export { setRotation }
