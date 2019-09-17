/**
 * Set skipRaycast on a node.
 * If raycast attribute is set to false, skip node raycast.
 * @param {HTMLElement} el HTML custom element.
 * @param {boolean} skipRaycast
 */
let setSkipRaycast = (node, skipRaycast = true) => {
  node.skipRaycast = skipRaycast;
};

export { setSkipRaycast }
