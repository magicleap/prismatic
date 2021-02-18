/**
 * Create main JS volume.
 * Returns the JS Volume.
 * @param {HTMLElement} el HTML custom element.
 * @returns {volume} JS Volume object.
 */
let createVolume = (el) => {
  /**
   * Throw error if volume already exists.
   */
  if (window.mlWorld.length !== 0) {
    throw new Error('Volume already exists');
  }

  /**
   * Create JS volume using default Stage size.
   * We need to create the volume with a small size and then we need to set the size.
   * We have a limitation to create a volume of a certain size at a certain point.
   */
  let volume = window.mlWorld.createVolume(0.1, 0.1, 0.1);

  /**
   * Throw error if volume was not created.
   */
  if (!volume) {
    throw new Error('Volume was not created');
  }

  /**
   * Add reference to volume for garbage collection.
   */
  el._volume = volume;

  /**
   * Set volume position to be on top of viewport (default).
   */
  const viewPortPositionTopLeftY = window.mlWorld.viewportHeight / 2 + window.mlWorld.viewPortPositionTopLeft.y;
  const transformMatrix = new DOMMatrix().translate(0, viewPortPositionTopLeftY, 0);
  volume.transformVolumeRelativeToHostVolume(transformMatrix);

  /**
   * Set size of the volume to match stage size (default)
   */
  volume.setSize(window.mlWorld.stageSize.x, window.mlWorld.stageSize.y, window.mlWorld.stageSize.z);

  /**
   * Volume visibility is hidden by default.
   */
  volume.visible = true;

  /**
   * Listen for animationEnd event and dispatch custom event from HTMLElement.
   */
  volume.addEventListener('mlanimation', (event) => {
    if (event.model && event.model.htmlElement) {
      let el = event.model.htmlElement;

      if (event.type === 'animationEnd') {
        let animationEndEvent = new CustomEvent('model-animation-end', {
          detail: { animationName: event.animationName }
        });

        el.dispatchEvent(animationEndEvent);
      }
      else if (event.type === 'animationLoop') {
        let animationLoopEvent = new CustomEvent('model-animation-loop', {
          detail: { animationName: event.animationName }
        });

        el.dispatchEvent(animationLoopEvent);
      }
    }
  });

  /**
   * Listen for mltransformanimation event and dispatch custom event from HTML custom element.
   */
  volume.addEventListener('mltransformanimation', function (event) {
    if (event.node && event.node.htmlElement) {
      let el = event.node.htmlElement;
      let transformAnimationEndEvent = new CustomEvent('transform-animation-end', {
        detail: { track: event.track, type: event.type }
      });
      el.dispatchEvent(transformAnimationEndEvent);
    }
  });

  /**
   * Listen for mlraycast event and dispatch custom event for node from HTML custom element when node is visible.
   * Add inputType property to custom event to differentiate between control and headpos raycast.
   * Dispatch mouseover, mouseout, mousemove from HTLM custome element to handle hover effect on extractable node.
   */
  volume.addEventListener('mlraycast', (event) => {
    if (event.hitData.targetNode && event.hitData.targetNode.htmlElement) {
      let el = event.hitData.targetNode.htmlElement;

      /**
       * Replace any instance of the word "Totem" in the event type to "Control".
       */
      let eventType = event.type.replace(/Totem/g, 'Control');

      /**
       * Get node. Either model or quad.
       */
      let node = (el._model ? el._model : el._quad);

      if (node && node.visible) {
        /**
         * Differentiate between control and headpos raycast.
         */
        let inputype = '';
        if (eventType.search(/control/i) >= 0) {
          inputype = 'control';

          if (eventType === 'nodeOnControlEnter') {
            let mouseoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            el.dispatchEvent(mouseoverEvent);
          }
          else if (eventType === 'nodeOnControlExit') {
            let mouseoutEvent = new MouseEvent('mouseout', { view: window, bubbles: true, cancelable: true });
            el.dispatchEvent(mouseoutEvent);
          }
        }
        else if (eventType.search(/head/i) >= 0) {
          inputype = 'headpos';
        }

        if (event.hitData.type === 'quadNode' || event.hitData.type === 'modelNode') {
          let newRaycastEvent = new CustomEvent('node-raycast', { detail: { inputType: inputype, type: eventType, hitData: event.hitData } });
          el.dispatchEvent(newRaycastEvent);
        }
      }
    }
  });

  /**
   * Listen for mlinput events with "triggerClick" gesture and dispatch custom mouse click event from HTML custom element.
   */
  volume.addEventListener('mlinput', (event) => {
    if (event.gesture === 'triggerClick' && event.targetNode && event.targetNode.htmlElement) {
      let el = event.targetNode.htmlElement;

      /**
       * Custom mouse click event.
       */
      let clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });

      el.dispatchEvent(clickEvent);
    }
  });

  /**
   * Listen for mlextraction event and dispatch custom mouselongpress event from HTML custom element to handle extraction.
   */
  volume.addEventListener('mlextraction', (event) => {
    if (event.targetNode && event.targetNode.htmlElement) {
      let el = event.targetNode.htmlElement;
      /**
       * Dispatch custom mouselongpress event to handle extraction.
       */
      el.dispatchEvent(new Event('mouselongpress'));
    }
  });

  return volume;
};

export { createVolume }
