import { getHTMLElementSize } from '../utilities/getHTMLElementSize.js';
import { quaternionToAngle } from '../utilities/quaternionToAngle.js';
import { VOLUME_GAP } from '../utilities/constants.js';

/**
 * Add mlextraction event listener to the HTML custom element to handle extraction.
 * @param {HTMLElement} el HTML custom element.
 */
let setNodeExtraction = (el) => {
  if (el) {
    el.addEventListener('mlextraction', handleExtraction, false);
  }
}

/**
 * Remove mlextraction event listener from the node.
 * @param {HTMLElement} el HTML custom element.
 */
let unsetNodeExtraction = (el) => {
  if (el) {
    el.removeEventListener('mlextraction', handleExtraction, false);
  }
};

/**
 * Node extraction handler.
 * @param {HTMLElement} el HTML custom element.
 */
let handleExtraction = (e) => {
  /**
   * Consume click event dispatched after long press when event is generated from HTML custom element.
   * isTrusted is true when mlextraction event is dispatched from HTML element.
   */
  if (e.isTrusted) {
    /**
     * Consume click event dispatched by API after long press.
     */
    window.addEventListener('click',  e => e.stopPropagation(), { once: true, capture: true });
  }

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
  if (node) {
    /**
     * Set model size to original (before mouse hoverover effect).
     */
    if (el._originalScale) {
      node.setLocalScale(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]));
    }

    /**
     * Set node position back to original (before mouse hoverover effect).
     */
    if (el._originalPosition) {
      el._mainTransform.setLocalPosition(new Float32Array([el._originalPosition[0], el._originalPosition[1], el._originalPosition[2]]));
    }

    /**
     * Get node scale.
     */
    let [nodeScaleWidth, nodeScaleHeight, nodeScaleBreadth] = node.getLocalScale();

    /**
     * Get main transform scale.
     */
    let [mainTransformScaleWidth, mainTransformScaleHeight, mainTransformScaleBreadth] = el._mainTransform.getLocalScale();

    /**
     * Get animation transform scale.
     */
    let [aniTransformScaleWidth, aniTransformScaleHeight, aniTransformScaleBreadth] = el._transform.getLocalScale();

    /**
     * Get current size of the node. To be used for volume of extracted node.
     */
    let currentNodeWidth, currentNodeHeight, currentNodeBreadth;
    if (el._model) {
      [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [el._resource.width * nodeScaleWidth * mainTransformScaleWidth * aniTransformScaleWidth, el._resource.height * nodeScaleHeight * mainTransformScaleHeight * aniTransformScaleHeight, el._resource.depth * nodeScaleBreadth * mainTransformScaleBreadth * aniTransformScaleBreadth];
    } else if (el._quad) {
      [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [nodeScaleWidth * mainTransformScaleWidth * aniTransformScaleWidth, nodeScaleHeight * mainTransformScaleHeight * aniTransformScaleHeight, nodeScaleBreadth * mainTransformScaleBreadth * aniTransformScaleBreadth];
    }

    /**
     * Assign current size to variables to be used to set the extracted volume size.
     */
    let [eWidth, eHeight, eBreadth] = [currentNodeWidth, currentNodeHeight, currentNodeBreadth];

    /**
     * Calculated scale to get to extracted-size.
     */
    let calculatedScale = 0;

    /**
     * Set the node size to extracted size attribute value.
     */
    if (el.hasAttribute('extracted-size')) {
      /**
       * Get the extracted size and validate value.
       */
      let [eWidthTmp, eHeightTmp, eBreadthTmp] = el.getAttribute('extracted-size').replace(/  +/g, ' ').split(' ').map(parseFloat);

      /**
       * When breadth is not available, use the min of extracted width and height size for models or 0.001 for quads.
       */
      if (isNaN(eBreadthTmp)) {
        eBreadthTmp = (el._quad) ? VOLUME_GAP : Math.min(eWidthTmp, eHeightTmp);
      }

      /**
       * Validate extracted size values.
       */
      if (isNaN(eWidthTmp) || isNaN(eHeightTmp) || isNaN(eBreadthTmp)) {
        console.warn(`Invalid value used for extracted-size attribute.`);
      }
      else {
        /**
         * Assign extracted size to variables to be used to set the extracted volume size.
         */
        [eWidth, eHeight, eBreadth] = [eWidthTmp, eHeightTmp, eBreadthTmp];

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
         * When scaling down, multiply the scaleDownRatio to transform and assign the opposite to extracted scale.
         * Get the new size of scale down node to calculate the extracted volume size (doExtraction).
         * This is done so the extracted model appears with the same size as the model on the page and then it will scale up.
         */
        if (scaleDownRatio < 1) {
          scaleToExtractedSizeWidth *= scaleDownRatio;
          scaleToExtractedSizeHeight *= scaleDownRatio;
          scaleToExtractedSizeBreadth *= scaleDownRatio;

          [eWidth, eHeight, eBreadth] = [currentNodeWidth * scaleToExtractedSizeWidth, currentNodeHeight * scaleToExtractedSizeHeight, currentNodeBreadth * scaleToExtractedSizeBreadth];

          calculatedScale = 1 / scaleDownRatio;
        }

        /**
         * Set the extracted node size.
         */
        el._mainTransform.setLocalScale(new Float32Array([mainTransformScaleWidth * scaleToExtractedSizeWidth, mainTransformScaleHeight * scaleToExtractedSizeHeight, mainTransformScaleBreadth * scaleToExtractedSizeBreadth]));
      }
    }//end extracted-size

    /**
     * Dispatch pre extracting-node synthetic event.
     */
    el.dispatchEvent(new Event('extracting-node'));

    /**
     * Get current postion in main transform.
     */
    let [mainTransformPositionX, mainTransformPositionY, mainTransformPositionZ] = el._mainTransform.getLocalPosition();

    /**
     * Get current postion in animation transform.
     */
    let [aniTransformPositionX, aniTransformPositionY, aniTransformPositionZ] = el._transform.getLocalPosition();

    /**
     * Calculate Z position for the extracted node.
     */
    let newPositionZ = aniTransformPositionZ + mainTransformPositionZ + currentNodeBreadth;

    /**
     * Create Matrix with position for the extracted node.
     */
    let transformMatrix = new DOMMatrix().translate(aniTransformPositionX + mainTransformPositionX + (window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, aniTransformPositionY + mainTransformPositionY + (window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y) + (window.mlWorld.stageExtent.top - window.mlWorld.stageExtent.bottom)/2, newPositionZ + (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2);

    /**
     * Use calculatedScale, otherwise use extracted-scale attribute.
     */
    let extractedScale = 1;
    if (calculatedScale > 0) {
      extractedScale = calculatedScale;
    }
    else if (el.hasAttribute('extracted-scale') && parseFloat(el.getAttribute('extracted-scale')) > 0) {
      extractedScale = parseFloat(el.getAttribute('extracted-scale'));
    }

    /**
     * Set the node in middle of main transform.
     */
    el._mainTransform.setLocalPosition(new Float32Array([0, 0, 0]));

    /**
     * Set the node in middle of animation transform.
     */
    el._transform.setLocalPosition(new Float32Array([0, 0, 0]));

    /***
     * Call extractContent on main transform.
     * Provide Matrix, size of the node to be extracted and extraction scale.
     */
    doExtraction(el, transformMatrix, {width:eWidth, height:eHeight, breadth: eBreadth}, extractedScale);

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

    /**
     * Dispatch node-extracted synthetic event.
     */
    el.dispatchEvent(new Event('node-extracted'));

  }
}

/**
 * Do extraction of node.
 * Dispatch node-extracted event.
 * @param {HTMLElement} el HTML custom element.
 * @param {DOMMatrix} transformMatrix Position of extracted node.
 * @param {JSONObject} eSize Size of volume of extracted node.
 * @param {Number} extractedScale Scale to be used once extracted.
 */
let doExtraction = (el, transformMatrix, eSize, extractedScale) => {
  /**
   * Check for specified path.
   * If no path is specified default to current site.
   */
  let path = (el.extractedLink) ? el.extractedLink : window.location.href;

  /**
   * If node rotation in any of the axes, calculate size of volume hosting the node after rotation.
   */
  if (el._transform.getLocalRotation().some(angle => angle !== 0)) {
    /**
     * Get the quaternion rotation from transform and convert to axes angles.
     */
    let rotationAngleArr = quaternionToAngle(el._transform.getLocalRotation());

    // roation on x axes
    if (rotationAngleArr[0]) {
      let breadth = Math.abs(Math.sin(rotationAngleArr[0])) * eSize.height + Math.abs(Math.cos(rotationAngleArr[0])) * eSize.breadth;
      let height = Math.abs(Math.sin(rotationAngleArr[0])) * eSize.breadth + Math.abs(Math.cos(rotationAngleArr[0])) * eSize.height;

      eSize.breadth = Math.max(eSize.breadth, breadth);
      eSize.height = Math.max(eSize.height, height);
    }

    // roation on y axes
    if (rotationAngleArr[1]) {
      let width = Math.abs(Math.sin(rotationAngleArr[1])) * eSize.breadth + Math.abs(Math.cos(rotationAngleArr[1])) * eSize.width;
      let breadth = Math.abs(Math.sin(rotationAngleArr[1])) * eSize.width + Math.abs(Math.cos(rotationAngleArr[1])) * eSize.breadth;

      eSize.width = Math.max(eSize.width, width);
      eSize.breadth = Math.max(eSize.breadth, breadth);
    }

    // roation on z
    if (rotationAngleArr[2]) {
      let width = Math.abs(Math.sin(rotationAngleArr[2])) * eSize.height + Math.abs(Math.cos(rotationAngleArr[2])) * eSize.width;
      let height = Math.abs(Math.sin(rotationAngleArr[2])) * eSize.width + Math.abs(Math.cos(rotationAngleArr[2])) * eSize.height;

      eSize.width = Math.max(eSize.width, width);
      eSize.height = Math.max(eSize.height, height);
    }
  }

  /**
   * If animated model, the AABB could be wrong.
   * Make the volume size twice as big.
   */
  if (el.hasAttribute('model-animation')) {
    eSize.width   *=  2;
    eSize.height  *=  2;
    eSize.breadth *=  2;
  }

  /**
   * Extract content with dictionary manifest
   */
  let extractionOptions = {
      scale: extractedScale,
      transform: transformMatrix,
      doIt: "auto",
      origin_url: path,
      width: eSize.width + VOLUME_GAP,
      height: eSize.height + VOLUME_GAP,
      breadth: eSize.breadth + VOLUME_GAP
  };

  /**
   * Call extractContent API.
   */
  let extractResult = el._mainTransform.extractContent(extractionOptions);
}

export { setNodeExtraction, unsetNodeExtraction, handleExtraction, doExtraction }
