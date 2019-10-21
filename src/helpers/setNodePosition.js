import { getCoordinates } from '../utilities/getCoordinates.js';
import { resetOriginalSizePosition } from '../utilities/resetOriginalSizePosition.js';

/**
 * Position the node on top of its HTMl Custom Element.
 * @param {HTMLElement} el HTML custom element.
 */
let setNodePosition = (el) => {
  if (el._mainTransform) {
    /**
     * Set node position.
     * Get the position, convert to meters and find mlWorld coordinates.
     */
    let { positionX, positionY, positionZ } = getCoordinates(el);
    el._mainTransform.setLocalPosition(new Float32Array([positionX, positionY, positionZ]));

    /* Reset hover effect properties set on setHoverState module.*/
    resetOriginalSizePosition(el);
  }
}

export { setNodePosition }
