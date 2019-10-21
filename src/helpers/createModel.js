import { setModelAttributes } from '../helpers/setModelAttributes.js';
import { setNodeSize as setModelSize} from '../helpers/setNodeSize.js';
import { setNodePosition as setModelPosition } from '../helpers/setNodePosition.js';

/**
 * Creates a Model.
 * @param {HTMLElement} el HTML custom element.
 * @param {JSONObject} resources Created by loadResource and contains model resource and shader type.
 */
let createModel = (el, resources) => {

  /**
   * Get the volume.
   */
  let volume = mlWorld[0];

  /**
   * Create Model.
   */
  if (!el._model) {
    el._model = volume.createModel();

    /**
     * Make node hidden initially.
     */
    el._model.visible = false;

    /**
     * Add reference to HTML Custom Element.
     */
    el._model.htmlElement = el;
  }

  /**
   * Set triggerable so volume doesn't go into placement mode when longpress trigger.
   */
  el._model.triggerable = true;

  /**
   * Add reference to resource.
   */
  el._resource = resources.resource;

  /**
   * Add resource to model.
   */
  el._model.setModelResource(el._resource);

  /**
   * After setModelResource, check for dimensions in MLModelResource to validate resource.
   */
  if (isNaN(parseFloat(el._resource.width)) || !isFinite(el._resource.width)) {
    throw new Error(`Set model resource failed: ${el.src}`);
  }

  /**
   * Once the mesh is loaded, dispatch resource-loaded synthetic event.
   */
  el.dispatchEvent(new Event('resource-loaded'));

  /**
   * Set shader.
   * Use Pbr shader when glb file. Otherwise shader is UnlitTextured.
   */
  el._model.shader = resources.shader;

   /**
    * Create transform if it does not exists.
    * Add model to transform, add transform to volume.
    */
   if (!el._transform) {
     /**
      * _transform is used for transform animations.
      */
     el._transform = volume.createTransform();
     /**
      * Add reference to HTML Custom Element.
      */
     el._transform.htmlElement = el;

     el._transform.addChild(el._model);

     /**
      * _mainTransform is used for size and position.
      */
     el._mainTransform = volume.createTransform();
     el._mainTransform.addChild(el._transform);

     volume.addChild(el._mainTransform);
   }

  /**
   * Create reference to textures and kmat.
   * This is required for garbage collection.
   */
  if (el._kmat && el._textures) {
    el._model.textures = el._textures;
    el._model.kmat = el._kmat;
  }

  /**
   * Set model size.
   * Set model anchor position to center.
   */
  setModelSize(el);

  /**
   * Set node position.
   * Position the node over top of its DOM Element.
   */
  setModelPosition(el);

  /**
   * Read all available attributes from element.
   */
  let elemAttributes = {
    trigger: el.getAttribute('trigger'),
    color: el.getAttribute('color'),
    raycast: el.getAttribute('raycast'),
    'model-scale': el.getAttribute('model-scale'),
    'scale': el.getAttribute('scale'),
    rotation: el.getAttribute('rotation'),
    'rotate-to-angles': el.getAttribute('rotate-to-angles'),
    'rotate-by-angles': el.getAttribute('rotate-by-angles'),
    'model-animation': el.getAttribute('model-animation'),
    spin: el.getAttribute('spin'),
    'scale-to': el.getAttribute('scale-to'),
    'scale-by': el.getAttribute('scale-by'),
    'move-to': el.getAttribute('move-to'),
    'move-by': el.getAttribute('move-by'),
    'environment-lighting': el.getAttribute('environment-lighting')
  };

  /**
   * Assign all elements attributes to model.
   */
  setModelAttributes(el, elemAttributes);

  /**
   * Call update after setting attributes.
   */
  window.mlWorld.update();

  /**
   * Once the everything is set, dispatch node-displayed synthetic event.
   */
  el.dispatchEvent(new Event('model-displayed'));

};

export { createModel }
