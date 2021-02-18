import { createVolume } from '../helpers/createVolume.js';
import { doModelRendering } from '../helpers/doModelRendering.js';
import { handleExtraction } from '../helpers/setNodeExtraction.js';
import { deleteNode } from '../helpers/deleteNode.js';

let DomExtractionEnabled = (el) => {
  /**
   * Return if extracted-src or extractable attributes are not preset.
   */
  let should_skip_dom_extraction = (el.tagName === 'ML-MODEL'
   || el.tagName === 'ML-QUAD'
   || !el.hasAttribute('extracted-src')
   || !el.hasAttribute('extractable')
   || (el.getAttribute('extractable') !== '' && el.getAttribute('extractable') !== 'true'));

  return !should_skip_dom_extraction;
};

let handleDomExtraction = (event) => {
  /**
   * Assign element.
   */
  let el = event.target;

  if (!DomExtractionEnabled(el)) return;

  /**
   * Skip all other extractions.
   */
  event.preventDefault();

  /**
   * Check for Volume.
   * If no volume, reset stage and create volume.
   */
  if (window.mlWorld.length === 0) {
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
};

let cancelDragOperationIfDomExtractionEnabled = (event) => {
  if (DomExtractionEnabled(event.target)) {
    event.preventDefault();
  }
};

export { cancelDragOperationIfDomExtractionEnabled, handleDomExtraction };
