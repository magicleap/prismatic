/**
 * @module helpers/setNodeSize
 */
import { doAutoSize } from '../utilities/doAutoSize.js';
import { getHTMLElementSize } from '../utilities/getHTMLElementSize.js';

/**
 * Scale node size to match HTML custom element.
 * @param {HTMLElement} el HTML custom element.
 */
let setNodeSize = (el) => {
  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  if (node) {
    /**
     * Set HTML element's dimensions if they were not specified via css.
     * When no width is specified, use clientHeight if available, otherwise use inherit, auto or parent's width.
     * When no height is specified, use inherit, auto or otherwise use clientWidth.
     */
    if (el.clientWidth === 0 || el.clientHeight === 0 ) {
      doAutoSize(el);
    }

    /**
     * Get the size of HTML custom element.
     */
    let { width, height, breadth } = getHTMLElementSize(el);

    /**
     * Throw error if any of the node's dimensions has not been specified.
     */
    if (width === 0 || height === 0 || breadth === 0) {
      console.warn(`At least one of the node\'s dimension is not specified.  Dimensions are specified using CSS width/height properties: ${el.id}.`);
    }
    else {
      /**
       * Model.
       */
      if (el._model) {
        if (el.hasAttribute("fill") && (el.getAttribute('fill') === '' || el.getAttribute('fill') === 'true')) {
          el._model.setLocalScale(new Float32Array([width / el._resource.width, height / el._resource.height, breadth / el._resource.depth]));
        }
        /* Uniformly scale */
        else {
          /**
           * User didn't specifed breadth: Do scale based on width and height
           */
          let scaleRatio;
          if (!el.breadth) {
            scaleRatio = Math.min(width / el._resource.width, height / el._resource.height);
          }
          else {
            scaleRatio = Math.min(width / el._resource.width, height / el._resource.height, breadth / el._resource.depth);
          }

          /* Set local scale on the model. */
          el._model.setLocalScale(new Float32Array([scaleRatio, scaleRatio, scaleRatio]));

          /* Set Anchor position. */
          el._model.setAnchorPosition(new Float32Array([el._resource.center.x, el._resource.center.y, el._resource.center.z]));
        }
      }
      /**
       * Quad.
       */
      else if (el._quad) {
        el._quad.setLocalScale(new Float32Array([width, height, 0]));
        el._quad.setLocalPosition(new Float32Array([-((width) / 2), -(height / 2), 0]));
      }
    }
  }
}

export { setNodeSize }
