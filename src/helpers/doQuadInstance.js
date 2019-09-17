import { createQuad } from '../helpers/createQuad.js';

 /**
  * Create an instance of a quad.
  * @param {HTMLElement} el HTML custom element.
  * @param {HTMLElement} elInstance HTML custom element. to create instance from.
  */
let doQuadInstance = (el, elInstance) => {
  /**
   * Get texture from elInsitance to create quad.
   */
  createQuad(el, elInstance._texture)
};

export { doQuadInstance }
