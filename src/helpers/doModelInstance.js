import { createModel } from '../helpers/createModel.js';

/**
 * Create an instance of a model.
 * @param {HTMLElement} el HTML custom element.
 * @param {HTMLElement} elInstance HTML custom element to create instance from.
 */
let doModelInstance = (el, elInstance) => {
  /**
   * Get resources from elInsitance to create model.
   */
  let resources = {resource: elInstance._resource, shader: elInstance._model.shader};
  createModel(el, resources);
};

export { doModelInstance }
