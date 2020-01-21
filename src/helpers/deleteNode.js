/**
 * Delete model or quad, transforms and attached properties.
 * @param {HTMLElement} el HTML custom element.
 */
let deleteNode = (el) => {
  if (el._model || el._quad) {
    if (el._model) {
      el._transform.removeChild(el._model);
    }
    else if (el._quad){
      el._transform.removeChild(el._quad);
    }

    el._mainTransform.removeChild(el._transform);
    mlWorld[0].removeChild(el._mainTransform)

    /**
     * Delete attached properties
     */
    delete el._model;
    delete el._quad;
    delete el._mainTransform;
    delete el._transform;
    delete el._resource;
    delete el._textures;
    delete el._kmat;
    delete el._texture;
  }
};

export { deleteNode }
