import { setQuadAttributes } from '../helpers/setQuadAttributes.js';
import { setSkipRaycast } from '../helpers/setSkipRaycast.js';
import { setNodeSize as setQuadSize } from '../helpers/setNodeSize.js';
import { setNodePosition as setQuadPosition } from '../helpers/setNodePosition.js';

/**
 * Creates a Quad.
 * @param {HTMLElement} el HTML custom element.
 * @param {texture} texture Created by createQuadTexture.
 */
let createQuad = (el, texture) => {
  /**
   * Get the volume.
   */
  let volume = mlWorld[0];

  /**
   * Create Quad.
   */
  if (!el._quad) {
    el._quad = volume.createQuad();

    /**
     * Make node hidden initially.
     */
    el._quad.visible = false;

    /**
     * Add reference to HTML Custom Element.
     */
    el._quad.htmlElement = el;

    /**
     * Set skipRaycast to true by default, unless raycast attribute is set to true.
     */
    if (el.raycast !== 'true') {
      setSkipRaycast(el._quad);
    }
  }

  /**
   * Add image texture to quad.
   */
  el._quad.setRenderResource(texture);

  /**
   * Set default transparent color when PNG.
   */
  let isPNG = new RegExp(/(\.png(\?|#|$))|^(data:image\/png;base64,*)/i);
  if (isPNG.test(el.src)) {
    el._quad.color = "rgba(255, 255, 255, 0.99)";
  }

  /**
   * Once the mesh is loaded, dispatch resource-loaded synthetic event.
   */
  var event = new Event('resource-loaded');
  el.dispatchEvent(event);

  /**
   * Create transform if it does not exists.
   * Add model to transform, add transform to volume.
   */
  if (!el._transform) {
    el._transform = volume.createTransform();
    /**
     * Add reference to HTML Custom Element.
     */
    el._transform.htmlElement = el;

    el._transform.addChild(el._quad);

    el._mainTransform = volume.createTransform();
    el._mainTransform.addChild(el._transform);

    volume.addChild(el._mainTransform);
  }

  /**
   * Set quad size.
   * Set quad anchor position to center.
   */
  setQuadSize(el);

  /**
   * Set node position.
   * Position the node over top of its DOM Element.
   */
  setQuadPosition(el);

  /**
   * Read all available attributes from element.
   */
  let elemAttributes = {
    trigger: el.getAttribute('trigger'),
    color: el.getAttribute('color'),
    'quad-scale': el.getAttribute('quad-scale'),
    'quad-position': el.getAttribute('quad-position'),
    rotation: el.getAttribute('rotation'),
    'rotate-to-angles': el.getAttribute('rotate-to-angles'),
    'rotate-by-angles': el.getAttribute('rotate-by-angles'),
    spin: el.getAttribute('spin'),
    'scale-to': el.getAttribute('scale-to'),
    'move-to': el.getAttribute('move-to'),
    'move-by': el.getAttribute('move-by'),
    'prism-rotation': el.getAttribute('prism-rotation')
  };

  /**
   * Assign all elements attributes to quad.
   */
  setQuadAttributes(el, elemAttributes);

  /**
   * Call update after setting attributes.
   */
  window.mlWorld.update();

  /**
   * Once the quad is loaded, dispatch resource-loaded synthetic event.
   */
  var event = new Event('quad-displayed');
  el.dispatchEvent(event);
}

export { createQuad }
