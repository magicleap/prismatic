/**
 * Set skipRaycast on a node.
 * If raycast attribute is set to false, skip node raycast.
 * @param {HTMLElement} el HTML custom element.
 * @param {boolean} [skipRaycast=false]
 */
let setSkipRaycast = (node, skipRaycast = false) => {
  node.skipRaycast = skipRaycast;
};

export { setSkipRaycast }
