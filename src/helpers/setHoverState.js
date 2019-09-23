import { MOUSE_OVER_Z_MOVE, MOUSE_OVER_RATIO } from '../utilities/constants.js';

/**
 * Add effects on node set as extractable.
 * Add mouseover event listener to increase the size of the node and move node on the z-axis on mouseover.
 * Add mouseout event listener to reset to node size and z-position on mouseout.
 * Add mousemove event listener to dispatch mouseover event on mousemove.
* @param {HTMLElement} el HTML custom element.
 */
let setHoverState = (el) => {
  /**
   * Change the style of the mouse cursor.
   * NOTE Grab not currently supported. Use vendor-prefixed -webkit-grab.
   */
  el.style.cursor = "-webkit-grab";

  /**
   * Add event Listeners for mouse over, out and move.
   */
  el.addEventListener('mouseover', handleHoverStateMouseOverListener);
  el.addEventListener('mouseout',  handleHoverStateMouseOutListener);
  el.addEventListener('mousemove', handleHoverStateMouseMoveListener);

};

/**
 * Remove mouseover event listener.
 * Remove mouseout event listener.
 * Remove mousemove event listener.
 */
let unsetHoverState = (el) => {
  /**
   * Reset the style of the mouse cursor.
   */
  el.style.cursor = "auto";

  /**
   * Remove event Listeners for mouse over, out and move.
   */
  el.removeEventListener('mouseover', handleHoverStateMouseOverListener);
  el.removeEventListener('mouseout',  handleHoverStateMouseOutListener);
  el.removeEventListener('mousemove', handleHoverStateMouseMoveListener);
};

/**
 * Handle mouseover event on an extractable node.
 */
let handleHoverStateMouseOverListener = (e) => {
  /**
   * Assign element to local variable.
   */
  let el = e.target;

  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * If the original position on Z is different from the current position on Z then mouse over effect already happened.
   */
  if (el._originalPosition && el._originalPosition[2] !== el._mainTransform.getLocalPosition()[2]) {
   return;
  }

  if (node && node.visible) {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Cancel mousemove on mouseover.
     */
    el.removeEventListener('mousemove', handleHoverStateMouseMoveListener);

    /**
     * Send control haptic tick on hover.
     */
    if (typeof volume.triggerControlHaptic === 'function') {
      volume.triggerControlHaptic("VIBE_TICK");
    }

    /**
     * Record current scale.
     */
    if (!el._originalScale) {
      el._originalScale = el._mainTransform.getLocalScale();
    }

    /**
     * Set mouseover node scale.
     */
    el._mainTransform.scaleTo(new Float32Array([el._originalScale[0] * MOUSE_OVER_RATIO, el._originalScale[1] * MOUSE_OVER_RATIO, el._originalScale[2] * MOUSE_OVER_RATIO]), 0.1, -1);

    /**
     * Record current position.
     */
    if (!el._originalPosition) {
      el._originalPosition = el._mainTransform.getLocalPosition();
    }

    /**
     * Set mouseover node move z-position.
     */
    el._mainTransform.moveTo(new Float32Array([el._originalPosition[0], el._originalPosition[1], (el._originalPosition[2] + MOUSE_OVER_Z_MOVE)]), 0.1, -2);
  }
}

/**
 * Handle mousemove event on an extractable node.
 */
let handleHoverStateMouseMoveListener = (e) => {
  let el = e.target;
  let mouseoverEvent = new MouseEvent('mouseover', {view: window, bubbles: true, cancelable: true});
  el.dispatchEvent(mouseoverEvent);
}

/**
 * Handle mouseout event on an extractable node.
 */
let handleHoverStateMouseOutListener = (e) => {
  /**
   * Assign element to local variable.
   */
  let el = e.target;

  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * If the original position on Z is the same as the current position on Z then reset of mouse over effect already happened.
   */
  if (el._originalPosition && el._originalPosition[2] === el._mainTransform.getLocalPosition()[2]) {
   return;
  }

  if (node) {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Send control haptic vibe on hover.
     */
    if (typeof volume.triggerControlHaptic === 'function') {
      volume.triggerControlHaptic("VIBE_FORCE_DWELL");
    }

    /**
     * Set mouseover node move z.
     */
    if (el._originalPosition) {
      el._mainTransform.moveTo(new Float32Array([el._originalPosition[0], el._originalPosition[1], el._originalPosition[2]]), 0.1, -1);
    }

    /**
     * Reset mouseeover node scale.
     */
    if (el._originalScale) {
      el._mainTransform.scaleTo(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]), 0.1, -2);
    }
  }
}

export {
  setHoverState,
  unsetHoverState
}
