import { setNodePosition } from '../helpers/setNodePosition.js';

/**
 * Add window resize event listener to set node position.
 * @param {HTMLElement} el HTML custom element.
 */
let setResizeListener = (el) => {
  if (el._resizeListener === undefined) {
    /**
     * Bind to current element.
     */
    el._resizeListener = handleResize.bind(el);
    window.addEventListener('resize', el._resizeListener);
  }
};

/**
 * Remove window resize event listener.
 * @param {HTMLElement} el HTML custom element.
 */
let unsetResizeListener = (el) => {
  if (el._resizeListener) {
    window.removeEventListener('resize', el._resizeListener);
    delete el._resizeListener;
  }
};

/**
 * Window resize handler. Set node position when window resize.
 */
function handleResize() {
  /**
   * Set position node when window is resized.
   */
  setNodePosition(this);
};

export { setResizeListener, unsetResizeListener}
