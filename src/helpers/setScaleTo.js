import { parseAnimation } from '../utilities/parseAnimation.js';

/**
 * The scaleTo attribute value is parsed, validated and added to transform.scaleTo().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} scaleToAttributeValue scaleTo attribute value.
  */
let setScaleTo = (el, scaleToAttributeValue) => {
  if (scaleToAttributeValue) {
    /**
     * Parse arguments: scaleTo, duration, track.
     */
    let nodeScaleTo = parseAnimation(scaleToAttributeValue);

    if (nodeScaleTo) {
      el._transform.scaleTo(new Float32Array(nodeScaleTo.axes), nodeScaleTo.duration, nodeScaleTo.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeScaleTo.track);
    }
  }
};

export { setScaleTo }
