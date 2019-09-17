import { parseAnimation } from '../utilities/parseAnimation.js';
import { pixelsToMetersSize } from '../utilities/pixelsToMetersSize.js';

 /**
  * The move-by attribute value is validated, parsed, converted to meters and added to transform.moveBy().
	* @param {HTMLElement} el HTML custom element.
  * @param {string} moveByAttributeValue Attribute moveBy value.
  */
let setMoveBy = (el, moveByAttributeValue) => {
  if (moveByAttributeValue) {
    /**
     * Parse arguments: moveby, duration, track.
     */
    let nodeMoveBy = parseAnimation(moveByAttributeValue);

    if (nodeMoveBy && nodeMoveBy.axes) {
      /**
       * Map moveBy axis values to pixels.
       */
      let moveByValues = nodeMoveBy.axes.map(pixelsToMetersSize);

      /* Do the transform animation */
      el._transform.moveBy(new Float32Array(moveByValues), nodeMoveBy.duration, nodeMoveBy.track);

      /* Calling addMoveCallback to have a mltransformanimation event sent back when animation is finished.*/
      el._transform.addMoveCallback(nodeMoveBy.track);
    }
    else {
      console.error(`Invalid axis values used for animation attribute. ${el.id}`);
    }
  }
};

export { setMoveBy }
