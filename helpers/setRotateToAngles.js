/**
 * @module helpers/setRotateToAngles
 */
import { parseAnimation } from '../utilities/parseAnimation.js';

/**
 * The rotate-to-angles attribute value is validated, parsed and added to transform.rotateToAngles().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} attributeValue RotateToAngles attribute value.
 */
let setRotateToAngles = (el, attributeValue) => {
  if (attributeValue) {
    let nodeRotation = parseAnimation(attributeValue);

    if (nodeRotation) {
      el._transform.rotateToAngles(new Float32Array(nodeRotation.angles), nodeRotation.duration, nodeRotation.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeRotation.track);
    }
  }
};

export { setRotateToAngles }
