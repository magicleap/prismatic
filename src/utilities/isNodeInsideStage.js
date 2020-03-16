/**
 * Calculate AABB Min and Max points for stage and node.
 * Compare Min and Max point to see if node is bounded.
 * @param {HTMLElement} el HTML custom element.
 */
let isNodeInsideStage = (el) => {
  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

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
   * Get animation transform scale.
   */
  let [aniTransformScaleWidth, aniTransformScaleHeight, aniTransformScaleBreadth] = el._transform.getLocalScale();

  /**
   * Get current size of the node.
   */
  let currentNodeWidth, currentNodeHeight, currentNodeBreadth;
  if (el._model) {
    [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [el._resource.width * nodeScaleWidth * mainTransformScaleWidth * aniTransformScaleWidth, el._resource.height * nodeScaleHeight * mainTransformScaleHeight * aniTransformScaleHeight, el._resource.depth * nodeScaleBreadth * mainTransformScaleBreadth * aniTransformScaleBreadth];
  } else if (el._quad) {
    [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [nodeScaleWidth * mainTransformScaleWidth * aniTransformScaleWidth, nodeScaleHeight * mainTransformScaleHeight * aniTransformScaleHeight, nodeScaleBreadth * mainTransformScaleBreadth * aniTransformScaleBreadth];
  }

  /**
   * Get the stage min and max coordinates.
   */
  let stageMaxX = Math.fround(window.mlWorld.stageSize.x / 2);
  let stageMinX = -stageMaxX;

  let stageMaxY = Math.fround(window.mlWorld.stageSize.y / 2);
  let stageMinY = -stageMaxY;

  let stageMaxZ = Math.fround(window.mlWorld.stageSize.z / 2);
  let stageMinZ = -stageMaxZ;

  let modelMinX = Math.fround(aniTransformPositionX + mainTransformPositionX - Math.fround(currentNodeWidth / 2));
  let modelMaxX = Math.fround(aniTransformPositionX + mainTransformPositionX + Math.fround(currentNodeWidth / 2));

  let modelMinY = Math.fround(aniTransformPositionY + mainTransformPositionY - Math.fround(currentNodeHeight / 2));
  let modelMaxY = Math.fround(aniTransformPositionY + mainTransformPositionY + Math.fround(currentNodeHeight / 2));

  let modelMinZ = Math.fround(aniTransformPositionZ + mainTransformPositionZ - Math.fround(currentNodeBreadth / 2));
  let modelMaxZ = Math.fround(aniTransformPositionZ + mainTransformPositionZ + Math.fround(currentNodeBreadth / 2));

  return  (stageMinX <= modelMinX) &&
          (modelMaxX <= stageMaxX) &&
          (stageMinY <= modelMinY) &&
          (modelMaxY <= stageMaxY) &&
          (stageMinZ <= modelMinZ) &&
          (modelMaxZ <= stageMaxZ);
}

export { isNodeInsideStage }
