/**
 * The scale attribute value is parsed and added to transform.setLocalScale().
 * @param {HTMLElement} el HTML custom element.
 * @param {string} nodeScale Node scale attribute value.
 */
let setScale = (el, nodeScale) => {
  if (nodeScale) {
    if (el._transform) {
      /**
       * Replace all non alphanumeric with a space.
       * Create scale array and cast to float.
       */
      let nodeScaleArr = nodeScale.trim().replace(/[^\d.-]+/g, ' ').split(' ').map(parseFloat).filter((val) => !isNaN(val));
      el._transform.setLocalScale(new Float32Array(nodeScaleArr));
    }
  }
};

export { setScale }
