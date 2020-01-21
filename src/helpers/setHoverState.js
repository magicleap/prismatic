import { MOUSE_OVER_Z_MOVE, MOUSE_OVER_RATIO } from '../utilities/constants.js';

/**
 * Add effects on node set as extractable.
 * Add mouseover event listener to increase the size of the node and move node on the z-axis on mouseover.
 * Add mouseout event listener to reset to node size and z-position on mouseout.
 * @param {HTMLElement} el HTML custom element.
 */
let setHoverState = (el) => {
  /**
   * Change the style of the mouse cursor.
   * NOTE Grab not currently supported. Use vendor-prefixed -webkit-grab.
   */
  el.style.cursor = "-webkit-grab";

  /**
   * Add event Listeners for mouse over and out.
   */
  el.addEventListener('mouseover', handleHoverStateMouseOverListener);
  el.addEventListener('mouseout',  handleHoverStateMouseOutListener);
};

/**
 * Remove mouseover event listener.
 * Remove mouseout event listener.
 */
let unsetHoverState = (el) => {
  /**
   * Reset the style of the mouse cursor.
   */
  el.style.cursor = "auto";

  /**
   * Remove event Listeners for mouse over and out.
   */
  el.removeEventListener('mouseover', handleHoverStateMouseOverListener);
  el.removeEventListener('mouseout',  handleHoverStateMouseOutListener);
};

/**
 * Debounce mouseover event on an extractable node.
 */
let handleHoverStateMouseOverListener = (e) => {
  /**
   * Debounce mouseover event to 250ms.
   */
  clearTimeout(e.target._mouseoverTimeoutId);
  e.target._mouseoverTimeoutId = setTimeout(() => handleHoverStateMouseOver(e), 250);
}

/**
 * Handle mouseover event on an extractable node.
 */
let handleHoverStateMouseOver = (e) => {
  /**
   * Assign element to local variable.
   */
  let el = e.target;

  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * Get the volume.
   */
  let volume = mlWorld[0];

  /**
   * Handle mouseover if volume and node is visible and last hover event was not a mouseover.
   */
  if (volume && volume.visible && node && node.visible && el._lastHoverEvent !== 'mouseover') {
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
      el._originalScale = node.getLocalScale();
    }

    /**
     * Set mouseover node scale.
     */
    node.scaleTo(new Float32Array([el._originalScale[0] * MOUSE_OVER_RATIO, el._originalScale[1] * MOUSE_OVER_RATIO, el._originalScale[2] * MOUSE_OVER_RATIO]), 0.1, -1);

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

    /**
     * Record last hover event.
     */
    el._lastHoverEvent = 'mouseover';
    /**
     * Record if last event was generated from HTML element.
     */
    el._lastHoverEventHtml = e.isTrusted;
  }
}

/**
 * Debounce mouseout event on an extractable node.
 */
let handleHoverStateMouseOutListener = (e) => {
  /**
   * Debounce mouseout event to 250ms.
   */
  clearTimeout(e.target._mouseoutTimeoutId);
  e.target._mouseoutTimeoutId = setTimeout(() => handleHoverStateMouseOut(e), 250);
}

/**
 * Handle mouseout event on an extractable node.
 */
let handleHoverStateMouseOut = (e) => {
  /**
   * Assign element to local variable.
   */
  let el = e.target;

  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * Get the volume.
   */
  let volume = mlWorld[0];

  /**
   * Handle mouseover event if node and last hover event event was not a mouseout.
   */
  if (node && el._lastHoverEvent === 'mouseover') {
    /**
     * Don't handle mouseout effect when last mouseover event was generated from HTML and current mouseout event is from raycast.
     */
    if (el._lastHoverEventHtml && !e.isTrusted) {
      return;
    }

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
      node.scaleTo(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]), 0.1, -2);
    }

    /**
     * Record last hover event.
     */
    el._lastHoverEvent = 'mouseout';
    /**
     * Record if last event was generated from HTML element.
     */
    el._lastHoverEventHtml = e.isTrusted;
  }
}

export {
  setHoverState,
  unsetHoverState
}
