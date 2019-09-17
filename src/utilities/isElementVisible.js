/**
 * @module utilities/isElementVisible
 */
/**
 * Determine if HTML custom element is visible in DOM.
 * Returns HTML custom element visible as a boolean.
 * @param {HTMLElement} el HTML custom element.
 * @returns {boolean} HTML custom element visible.
 */
let isElementVisible = (el) => {
  if (!el) return false;

  let compStyles = window.getComputedStyle(el, '');
  if (compStyles.display == 'none') return false;
  if (compStyles.visibility == 'hidden') return false;
  if (el.hidden) return false;

  return true;
}

export { isElementVisible }
