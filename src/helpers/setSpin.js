import { parseAnimation } from '../utilities/parseAnimation.js';

/**
 * The spin attribute value is validated, parsed and added to transform.spin().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} spinAttributeValue Spin attribute value.
 */
let setSpin = (el, spinAttributeValue) => {
  if (spinAttributeValue) {
    let spinBol = true;

    /**
     * Parse arguments: axis, angle, duration, track.
     */
    let nodeSpin = parseAnimation(spinAttributeValue, spinBol);

    if (nodeSpin){
      el._transform.spin(new Float32Array(nodeSpin.axes), nodeSpin.angle, nodeSpin.duration, nodeSpin.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeSpin.track);
    }
  }
};

export { setSpin }
