import { getHTMLElementSize } from '../utilities/getHTMLElementSize.js';

/**
 * Get the size of the node.
 * The size could be specified via CSS using width and height properties and breadth attribute OR
 * when DOM extraction, use 15% of browsers dimension.
 * @param {HTMLElement} el HTML custom element.
 */
let getNodeSize = (el) => {

  let width, height, breadth;

  /**
   * ml-model or ml-quad.
   */
  if (el.tagName === 'ML-MODEL' || el.tagName === 'ML-QUAD') {
    /**
     * Get the size of HTML custom element.
     */
    let elSize = getHTMLElementSize(el);
    width = elSize.width;
    height = elSize.height;
    breadth = elSize.breadth;

  }
  /**
   * DOM extraction. Get the initial size
   */
  else if ( el.hasAttribute('extracted-src')) {
    /**
     * Get the initial size by calculating 15 percent of the browser's dimensions.
     */
    width = (mlWorld.viewportWidth / 100 ) * 15 ;
    height = (mlWorld.viewportHeight / 100 ) * 15 ;
    breadth = Math.max(width, height);
  }

  return {
    width: width,
    height: height,
    breadth: breadth
  };
}

export { getNodeSize }
