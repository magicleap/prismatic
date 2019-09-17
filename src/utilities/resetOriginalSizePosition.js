/**
 * Reset properties set on setHoverState module.
 * @param {HTMLElement} el HTML custom element.
 */
let resetOriginalSizePosition = (el) => {
  delete el._originalPosition;
  delete el._originalScale;
};

export { resetOriginalSizePosition }
