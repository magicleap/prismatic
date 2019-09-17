import { parseRotation } from '../utilities/parseRotation.js';
import { eulerToQuaternion } from '../utilities/eulerToQuaternion.js';

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
    let rotationQuaternionArr = eulerToQuaternion(parseRotation(rotation));
    if (rotationQuaternionArr && el._transform) {
      el._transform.setLocalRotation(new Float32Array(rotationQuaternionArr));
    }
  }
};

export { setRotation }
