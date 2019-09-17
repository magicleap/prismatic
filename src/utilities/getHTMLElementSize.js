import { pixelsToMetersSize } from '../utilities/pixelsToMetersSize.js';

/**
 * Get the size from the HTML Custom Element.
 * Returns JSON object with width, height and breadth.
 * @param {HTMLElement} el HTML custom element.
 * @returns {JSONObject} Width, height and breadth.
 */
let getHTMLElementSize = (el) => {
  return {
    width: pixelsToMetersSize(el.clientWidth),
    height: pixelsToMetersSize(el.clientHeight),
    breadth: el.breadth ? pixelsToMetersSize(el.breadth) : pixelsToMetersSize(Math.max(el.clientWidth, el.clientHeight))
  };
};

export { getHTMLElementSize }
