 /**
 * Handler when Stage changes.
 * Set new position and size of JS volume.
 */
let mainStageChangedListener = () => {
  if (mlWorld.length > 0) {
    /**
     * Get the volume.
     */
     let volume = mlWorld[0];

    /**
     * Set new position of JS volume.
     */
    const viewPortPositionTopLeftY = window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y;
    const transformMatrix = new DOMMatrix().translate((window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, viewPortPositionTopLeftY + (window.mlWorld.stageExtent.top - window.mlWorld.stageExtent.bottom)/2, (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2);
    volume.transformVolumeRelativeToHostVolume(transformMatrix);

    /**
     * Set new size JS volume.
     */
    volume.setSize(window.mlWorld.stageSize.x, window.mlWorld.stageSize.y, window.mlWorld.stageSize.z);
  }
};

export { mainStageChangedListener }
