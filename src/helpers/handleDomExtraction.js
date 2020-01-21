import { createVolume } from '../helpers/createVolume.js'
import { doModelRendering } from '../helpers/doModelRendering.js';
import { handleExtraction } from '../helpers/setNodeExtraction.js';
import { deleteNode } from '../helpers/deleteNode.js'

let handleDomExtraction = (event) => {
  if (event.button !== 6) {
    return;
  }

  /**
   * Assign element.
   */
  let el = event.target;

  /**
   * Check extracted-src and extractable attributes are preset.
   */
  if (el.tagName !== 'ML-MODEL' && el.tagName !== 'ML-QUAD' && el.hasAttribute('extracted-src') && el.hasAttribute('extractable') && (el.getAttribute('extractable') === '' || el.getAttribute('extractable') === 'true')) {
    /**
     * Skip all other extractions.
     */
    event.preventDefault();

    /**
     * Check for Volume.
     * If no volume, reset stage and create volume.
     */
    if (mlWorld.length === 0) {
      /**
       * Reset stage.
       */
      window.mlWorld.resetStageExtent();

      /**
       * Create volume.
       */
      createVolume(el);
    }

    /**
     * Render model.
     */
    doModelRendering(el, el.getAttribute('extracted-src')).then(() => {
      /**
       * Don't show model.
       */
      el._model.visible = false;

      /**
       * Do the extraction of the model.
       */
      handleExtraction(event);

      /**
       * Delete model.
       */
      deleteNode(el);

    }).catch((err) => {
      /* Show error. */
      console.error(`Problem extracting node: ${err}`);
    });
  }
}

export { handleDomExtraction }
