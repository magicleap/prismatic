import { parseMaterials } from '../utilities/parseMaterials.js';

import { createTextures } from '../helpers/createTextures.js';
import { createKMat } from '../helpers/createKMat.js';
import { loadResource } from '../helpers/loadResource.js';
import { createModel } from '../helpers/createModel.js';

/**
 * Render the model node.
 * @param {HTMLElement} el HTML custom element.
 * @param {string} [src = el.src] - Location of model to be rendered.
 */
let doModelRendering = async (el, src = el.src) => {
  /**
   * Get the volume.
   */
  let volume = window.mlWorld[0];

  /**
   * Materials attribute has kmat and textures.
   * Parse and validate materials.
   */
  if (el.hasAttribute('materials')) {
    let materials = parseMaterials(el.getAttribute('materials'));

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
  }

  /**
   * Dispatch synthetic event mesh-readytoload.
   */
  el.dispatchEvent(new Event('mesh-readytoload'));

  /**
   * Get the model's resources.
   */
  let resources = await loadResource(el, src);

  await createModel(el, resources);
 };

export { doModelRendering }
