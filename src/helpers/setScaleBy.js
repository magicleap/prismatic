import { parseAnimation } from '../utilities/parseAnimation.js';

/**
 * The scaleBy attribute value is parsed, validated and added to transform.scaleBy().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} scaleByAttributeValue scaleBy attribute value.
  */
let setScaleBy = (el, scaleByAttributeValue) => {
  if (scaleByAttributeValue) {
    /**
     * Parse arguments: scaleBy, duration, track.
     */
    let nodeScaleBy = parseAnimation(scaleByAttributeValue);

    if (nodeScaleBy) {
      el._transform.scaleBy(new Float32Array(nodeScaleBy.axes), nodeScaleBy.duration, nodeScaleBy.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeScaleBy.track);
    }
  }
};

export { setScaleBy }
