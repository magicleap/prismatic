import { parseAnimation } from '../utilities/parseAnimation.js';

/**
 * The rotate-by-angles attribute value is validated, parsed and added to transform.rotateByAngles().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} attributeValue RotateByAngles attribute value.
 */
let setRotateByAngles = (el, attributeValue) => {
  if (attributeValue) {
    let nodeRotation = parseAnimation(attributeValue);

    if (nodeRotation) {
      el._transform.rotateByAngles(new Float32Array(nodeRotation.angles), nodeRotation.duration, nodeRotation.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeRotation.track);
    }
  }
};

export { setRotateByAngles }
