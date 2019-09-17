import { getCoordinates } from '../utilities/getCoordinates.js';

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
  }
}

export { setNodePosition }
