import { parseAnimation } from '../utilities/parseAnimation.js';
import { getOffsetCoordinates } from '../utilities/getOffsetCoordinates.js';
import { pixelsToMetersSize } from '../utilities/pixelsToMetersSize.js';

/**
 * The move-to attribute value is validated, parsed, converted to meters and added to transform.moveBy().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} moveToAttributeValue Attribute moveTo value.
 */
let setMoveTo = (el, moveToAttributeValue) => {
  if (moveToAttributeValue) {
    /**
     * Parse arguments: offset or axes, duration, track.
     */
    let nodeMoveTo = parseAnimation(moveToAttributeValue);

    if (nodeMoveTo) {
      let nodeDestination;

      if (nodeMoveTo.offset) {
        /**
         * Return array of the coordinates from offset values.
         */
        nodeDestination = getOffsetCoordinates(el, nodeMoveTo.offset)
      }
      else if (nodeMoveTo.axes) {
        /**
         * Return array of the coordinates from axes values.
         */
        nodeDestination = getOffsetCoordinates(el, nodeMoveTo.axes)
      }

      /* Do the transform animation */
      el._transform.moveTo(new Float32Array(nodeDestination), nodeMoveTo.duration, nodeMoveTo.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
      el._transform.addMoveCallback(nodeMoveTo.track);
    }
  }
};

export { setMoveTo }
