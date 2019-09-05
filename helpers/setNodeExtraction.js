/**
 * @module helpers/setNodeExtraction
 */
import { VOLUME_GAP_RATIO } from '../utilities/constants.js';
import { getHTMLElementSize } from '../utilities/getHTMLElementSize.js';

/**
 * Add mousedown event listener to the HTML custom element to handle extraction.
 * @param {HTMLElement} el HTML custom element.
 */
let setNodeExtraction = (el) => {
  if (el) {
    el.addEventListener('mousedown', handleExtraction, false);
  }
}

/**
* Remove mousedown event listener from the node.
* @param {HTMLElement} el HTML custom element.
 */
let unsetNodeExtraction = (el) => {
  if (el) {
    el.removeEventListener('mousedown', handleExtraction, false);
  }
};

/**
 * Node extraction handler.
 * @param {HTMLElement} el HTML custom element.
 */
let handleExtraction = (e) => {
  /**
   * Return if not initiated from trigger.
   */
  if (e.button !== 6) {
    return;
  }

  e.stopImmediatePropagation();

  /**
   * Assign element to local variable.
   */
  let el = e.target;

  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * Extract node.
   */
  if (node && node.visible) {
    /**
     * Set model size to original (before mouse hoverover effect).
     */
    if (el._originalScale) {
      el._mainTransform.setLocalScale(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]));
    }

    /**
     * Set node position back to original (before mouse hoverover effect).
     */
    if (el._originalPosition) {
      el._mainTransform.setLocalPosition(new Float32Array([el._originalPosition[0], el._originalPosition[1], el._originalPosition[2]]));
    }

    /**
     * Get current postion in main transform.
     */
    let [mainTransformPositionX, mainTransformPositionY, mainTransformPositionZ] = el._mainTransform.getLocalPosition();

    /**
     * Get current postion in animation transform.
     */
    let [aniTransformPositionX, aniTransformPositionY, aniTransformPositionZ] = el._transform.getLocalPosition();

    /**
     * Get node scale.
     */
    let [nodeScaleWidth, nodeScaleHeight, nodeScaleBreadth] = node.getLocalScale();

    /**
     * Get main transform scale.
     */
    let [mainTransformScaleWidth, mainTransformScaleHeight, mainTransformScaleBreadth] = el._mainTransform.getLocalScale();

    /**
     * Get current size of the node. To be used for volume of extracted node.
     */
    let currentNodeWidth, currentNodeHeight, currentNodeBreadth;
    if (el._model) {
      [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [el._resource.width * nodeScaleWidth * mainTransformScaleWidth, el._resource.height * nodeScaleHeight * mainTransformScaleHeight, el._resource.depth * nodeScaleBreadth * mainTransformScaleBreadth]
    } else if (el._quad) {
      [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [nodeScaleWidth * mainTransformScaleWidth, nodeScaleHeight * mainTransformScaleHeight, nodeScaleBreadth * mainTransformScaleBreadth];
    }

    /**
     * Assign current size to eSise which is used to set the extracted volume size.
     */
    let [eWidth, eHeight, eBreadth] = [currentNodeWidth, currentNodeHeight, currentNodeBreadth];

    /**
     * Set the node size to extracted size attribute value.
     */
    if (el.extractedSize) {
      /**
       * Get the extracted size and validate value.
       */
      [eWidth, eHeight, eBreadth] = el.extractedSize.replace(/  +/g, ' ').split(' ').map(parseFloat);

      /**
       * When breadth is not available, use the min of extracted width and height size for models or 0.001 for quads.
       */
      if (isNaN(eBreadth)) {
        eBreadth = (el._quad) ?  0.001 : Math.min(eWidth, eHeight);
      }

      /**
       * Validate extracted size values.
       */
      if (isNaN(eWidth) || isNaN(eHeight) || isNaN(eBreadth)) {
        console.warn(`Invalid value used for extracted-size attribute.`);
        return;
      }

      /**
       * Calculate scale to get to extracted-size.
       */
      let scaleToExtractedSizeWidth = eWidth / currentNodeWidth;
      let scaleToExtractedSizeHeight = eHeight / currentNodeHeight;
      let scaleToExtractedSizeBreadth = eBreadth / currentNodeBreadth;

      /**
       * Calculate minumun scale to uniformly scale model to match current dimensions on page.
       */
      let scaleDownRatio = Math.min(currentNodeWidth / eWidth, currentNodeHeight / eHeight);

      /**
       * When scaling down, multiply the scaleDownRatio to transform and assign the oposite to extracted scale.
       * Get the new size of scale down node to calculate the extracted volume size (doExtraction).
       * This is done so the extracted model appears with the same size as the model on the page and then it will scale up.
       */
      if (scaleDownRatio < 1) {
        scaleToExtractedSizeWidth *= scaleDownRatio;
        scaleToExtractedSizeHeight *= scaleDownRatio;
        scaleToExtractedSizeBreadth *= scaleDownRatio;

        [eWidth, eHeight, eBreadth] = [currentNodeWidth * scaleToExtractedSizeWidth, currentNodeHeight * scaleToExtractedSizeHeight, currentNodeBreadth * scaleToExtractedSizeBreadth];

        el.extractedScale = 1 / scaleDownRatio;
      }

      /**
       * Set the extracted node size.
       */
      el._mainTransform.setLocalScale(new Float32Array([mainTransformScaleWidth * scaleToExtractedSizeWidth, mainTransformScaleHeight * scaleToExtractedSizeHeight, mainTransformScaleBreadth * scaleToExtractedSizeBreadth]));
    }//end extracted-size

    /**
     * Dispatch pre node-extracted synthetic event.
     */
    let event = new Event('extracting-node');
    el.dispatchEvent(event);

    /**
     * Set the node in middle of main transform.
     */
    el._mainTransform.setLocalPosition(new Float32Array([0, 0, 0]));

    /**
     * Set the node in middle of animation transform.
     */
    el._transform.setLocalPosition(new Float32Array([0, 0, 0]));

    /**
     * Calculate Z position for the extracted node.
     */
    let newPositionZ;
    if (el._model) {
      newPositionZ = mainTransformPositionZ + (el._resource.depth * el._model.getLocalScale()[2]);
    } else if (el._quad) {
      newPositionZ = mainTransformPositionZ;
    }

    /**
     * Create Matrix with position for the extracted node.
     */
    let transformMatrix = new DOMMatrix().translate(mainTransformPositionX, mainTransformPositionY + (window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y) , newPositionZ);

    /***
     * Call extractContent on transform.
     * Provide Matrix and size of the node to be extracted.
     */
    doExtraction(el, transformMatrix, {width:eWidth, height:eHeight, breadth: eBreadth});

    /**
     * Consume click event dispatched by API after long press.
     */
    el.addEventListener('click', event => event.stopImmediatePropagation(), {once:true});

    /**
     * Resize node back to original in main Transform.
     */
    el._mainTransform.setLocalScale(new Float32Array([mainTransformScaleWidth, mainTransformScaleHeight, mainTransformScaleBreadth]));

    /**
     * Set the node's postion back to original in main transform.
     */
    el._mainTransform.setLocalPosition(new Float32Array([mainTransformPositionX, mainTransformPositionY, mainTransformPositionZ]));

    /**
     * Set the node's position back to original in animation transform.
     */
    el._transform.setLocalPosition(new Float32Array([aniTransformPositionX, aniTransformPositionY, aniTransformPositionZ]));
  }
}

/**
 * Do extraction of node.
 * Dispatch node-extracted event.
  * @param {HTMLElement} el HTML custom element.
	* @param {DOMMatrix} transformMatrix Position of extracted node.
	* @param {JSONObject} eSize Size of volume of extracted node.
 */
let doExtraction = (el, transformMatrix, eSize) => {
  /**
   * Use extractedScale if specified, otherwise set extractedScale to 1.
   */
  let extractedScale = el.extractedScale ? el.extractedScale : 1;

  /**
   * Check for specified path.
   * If no path is specified default to current site.
   */
  let path = (el.extractedLink) ? el.extractedLink : window.location.href;

  /**
   * If animated model, the AABB could be wrong.
   * Use the size from HTML custom element, when no extracted Size.
   */
  if (el.animation && !el.extractedSize) {
    let { width, height, breadth } = getHTMLElementSize(el);
    eSize.width   = width;
    eSize.height  = height;
    eSize.breadth = breadth;
  }

  /**
   * Extract content with dictionary manifest
   */
  el._mainTransform.extractContent({
    scale: extractedScale,
    transform: transformMatrix,
    doIt: "auto",
    origin_url: path,
    width: eSize.width * VOLUME_GAP_RATIO,
    height: eSize.height * VOLUME_GAP_RATIO,
    breadth: eSize.breadth * VOLUME_GAP_RATIO
  });

  /**
   * Dispatch node-extracted synthetic event.
   */
  let event = new Event('node-extracted');
  el.dispatchEvent(event);
}

export { setNodeExtraction, unsetNodeExtraction }
