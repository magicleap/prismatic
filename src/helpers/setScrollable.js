/**
 * @module helpers/setScrollable
 */
import { setNodePosition } from '../helpers/setNodePosition.js';

/**
 * Make nodes scrollable.
 * Add window scroll event listener to scroll node together with the HTML Custom element.
 * @param {HTMLElement} el HTML custom element.
 */
let setScrollable = (el) => {
  if (el._scrollListener === undefined) {
    /**
     * Bind to current element.
     */
    el._scrollListener = handleScrolling.bind(el);
    window.addEventListener('scroll', el._scrollListener);
  }
};

/**
 * Remove window scroll event listener used to scroll node together.
 * @param {HTMLElement} el HTML custom element.
 */
let unsetScrollable = (el) => {
  if (el._scrollListener) {
    window.removeEventListener('scroll', el._scrollListener);
    delete el._scrollListener;
  }
};

/**
 * Window scroll handler. Set node position when scrolling.
 */
function handleScrolling() {
  /**
   * Set node position when scrolling.
   */
  setNodePosition(this);
};

export { setScrollable, unsetScrollable, handleScrolling }
