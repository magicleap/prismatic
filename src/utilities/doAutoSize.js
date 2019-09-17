/**
 * @module utilities/doAutoSize
 */

import { setMutationObserver, unsetMutationObserver } from '../helpers/setMutationObserver.js';
import { isElementVisible } from '../utilities/isElementVisible.js';

/**
 * When width and height size of the node is not specified via css, set the size of HTML custom element.
 * @param {HTMLElement} el HTML custom element.
 */
let doAutoSize = (el) => {
  if (isElementVisible(el) && (el.clientWidth === 0 || el.clientHeight === 0)) {

    /**
     * Stop observing HTML element.
     */
    unsetMutationObserver(el);

    /**
     * No width specified via css.
     * Use clientHeight if available, otherwise use inherit, auto or parent's width.
     */
    if (el.clientWidth === 0) {
      if (el.clientHeight > 0) {
        el.style.width = `${el.clientHeight}px`;
      }
      else {
        el.style.width = `inherit`;
      }

      if (el.clientWidth === 0) {
        el.style.width = `auto`;
      }

      if (el.clientWidth === 0) {
        el.style.width = `${el.parentElement.clientWidth}px`;
      }
    }

    /**
     * No height specified via css.
     * Use inherit, auto or otherwise use clientWidth.
     */
    if (el.clientHeight === 0) {
      el.style.height = `inherit`;

      if (el.clientHeight === 0) {
        el.style.height = `auto`;
      }

      if (el.clientHeight === 0) {
        if (el.clientWidth > 0) {
          el.style.height = `${el.clientWidth}px`;
        }
      }
    }

    /**
     * Start observing the element again.
     */
    setMutationObserver(el);
  }

};

export { doAutoSize }
