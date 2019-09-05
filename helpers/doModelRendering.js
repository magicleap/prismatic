/**
 * @module helpers/doModelRendering
 */
import { parseMaterials } from '../utilities/parseMaterials.js';

import { createTextures } from '../helpers/createTextures.js';
import { createKMat } from '../helpers/createKMat.js';
import { loadResource } from '../helpers/loadResource.js';
import { createModel } from '../helpers/createModel.js';

/**
 * Render the model node.
 * @param {HTMLElement} el HTML custom element.
 */
let doModelRendering = async (el) => {
  /**
   * Get the volume.
   */
  var volume = mlWorld[0];

  /**
   * Materials attribute has kmat and textures.
   * Parse and validate materials.
   */
  if (el.hasAttribute('materials')) {
    var materials = parseMaterials(el.getAttribute('materials'));
  }

  if (materials) {
    /**
     * Create textures, read textures array returned.
     */
    el._textures = await createTextures(materials.textures);

    /**
     * Create KMat, read KMat returned.
     */
    el._kmat = await createKMat(materials.kmat);

    /**
     * Add texture resources to kmat.
     */
    el._textures.forEach(texture => {
      el._kmat.addDependentResource(texture);
    });
  }

  /**
   * Dispatch synthetic event mesh-readytoload.
   */
  let event = new Event('mesh-readytoload');
  el.dispatchEvent(event);

  /**
   * Get the model's resources.
   */
  let resources = await loadResource(el, el.getAttribute('src'));

  return createModel(el, resources);
 };

export { doModelRendering }
