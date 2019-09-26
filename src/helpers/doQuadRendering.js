import { createQuadTexture } from '../helpers/createQuadTexture.js';
import { createQuad } from '../helpers/createQuad.js';

 /**
  * Render the quad node.
  * @param {HTMLElement} el HTML custom element.
  */
let doQuadRendering = async (el) => {
  /**
   * Create texture for quad.
   * Keep reference to texture.
   */
  el._texture = await createQuadTexture(el.getAttribute('src'));

  /**
   * Dispatch synthetic event quad-readytoload.
   */
  el.dispatchEvent(new Event('quad-readytoload'));

  /**
   * create the quad.
   */
  return createQuad(el, el._texture);
};

export { doQuadRendering }
