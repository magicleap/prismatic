/**
 * Handler when Stage changes or page is rotated.
 * Set new position, size and rotation of JS volume.
 */
let mainStageChangedListener = () => {
  if (mlWorld.length > 0) {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Set new position and rotation of JS volume.
     */
    let transformMatrix = new DOMMatrix();
    let orientation = window.mlWorld.orientation;

    if (orientation === "flat") {
      transformMatrix = transformMatrix.translate((window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, window.mlWorld.viewPortPositionTopLeft.y + (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2, (window.mlWorld.stageExtent.bottom - window.mlWorld.stageExtent.top)/2);
      transformMatrix = transformMatrix.rotateAxisAngle(1, 0, 0, -90);
    }
    else {
      const viewPortPositionTopLeftY = window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y;
      transformMatrix = transformMatrix.translate((window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, viewPortPositionTopLeftY + (window.mlWorld.stageExtent.top - window.mlWorld.stageExtent.bottom)/2, (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2);
      transformMatrix = transformMatrix.rotateAxisAngle(1, 0, 0, 0);
    }

    /**
     * Apply tranformMatrix to JS volume.
     */
    volume.transformVolumeRelativeToHostVolume(transformMatrix);

    /**
     * Set new size JS volume.
     */
    volume.setSize(window.mlWorld.stageSize.x, window.mlWorld.stageSize.y, window.mlWorld.stageSize.z);
  }
};

export { mainStageChangedListener }
