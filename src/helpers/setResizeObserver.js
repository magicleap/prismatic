import { setNodeSize} from '../helpers/setNodeSize.js';

/**
 * Add ResizeObserver to detect change in size of the HTML Custom element.
 * Re-size node when HTML custom element size changes.
 * @param {HTMLElement} el HTML custom element.
 */
let setResizeObserver = (el) => {
  if (el._resizeObserver === undefined) {
    el._resizeObserver = new ResizeObserver( resizes => {
      resizes.forEach(resize => {
        /**
         * Update size and possition
         */
        setNodeSize(resize.target);
      });
    });

    el._resizeObserver.observe(el);
  }
};
/**
 * Remove ResizeObserver used to detect change in size of the HTML Custom element.
 */
let unsetResizeObserver = (el) => {
  if (el._resizeObserver) {
    el._resizeObserver.disconnect();
    delete el._resizeObserver;
  }
};

export { setResizeObserver, unsetResizeObserver}
