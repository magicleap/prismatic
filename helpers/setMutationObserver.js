/**
 * @module helpers/setMutationObserver
 */
import { setNodePosition } from '../helpers/setNodePosition.js';
import { isElementVisible } from '../utilities/isElementVisible.js';

/**
 * Add MutationObserver to detect changes on position and visibility of HTML custom element via CSS class or style.
 * Re-position node when HTML custom element size/position changes via style attribute or css class.
 * Show/Hide node when HTML custom elelemt visibility changes via CSS.
 * @param {HTMLElement} el HTML custom element.
 */
let setMutationObserver = (el) => {
  if (el._mutationObserver === undefined) {
    el._mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {

        /**
         * Get node. Either model or quad.
         */
        let node = (mutation.target._model ? mutation.target._model : mutation.target._quad);

        /**
         * Hide node when css visibility hidden and node is visible and there is no visibility attribute in HTML custom element.
         */
        if (!isElementVisible(el) && node.visible && !el.hasAttribute('visibility')) {
          node.visible = false;
        }
        /**
         * Show node when css visibility is visible and node is hidden and there is no visibility attribute in HTML custom element.
         */
        else if (isElementVisible(el) && !node.visible && !el.hasAttribute('visibility')) {
          node.visible = true;
        }

        /**
         * Update and possition
         */
        setNodePosition(mutation.target);
      });
    });

    var observerConfig = {
      attributeOldValue: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    };

    el._mutationObserver.observe(el, observerConfig);
  }
};

/**
 * Remove MutationObserver used to detect changes on position and visibility of HTML custom element.
 */
let unsetMutationObserver = (el) => {
  if (el._mutationObserver) {
    el._mutationObserver.disconnect();
    delete el._mutationObserver;
  }
};

export { setMutationObserver, unsetMutationObserver}
