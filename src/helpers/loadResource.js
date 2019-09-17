/**
 * @module helpers/loadResource
 */
/**
 * Create a model resource and find the shader type.
 * Returns resources object with resource and shader type.
 * @param {HTMLElement} el HTML custom element.
 * @param {string} modelSrc Path to model file.
 * @returns {Promise} Promise object represents the resources.
 */
let loadResource = async (el, modelSrc) => {
  /* Check for valid file extension */
  let modelValidExtRe = new RegExp(/\.(fbx|glb)(\?|#|$)/i);
  if (!modelValidExtRe.test(modelSrc)) {
    let modelTypeError = new Error(`Invalid model file extension: ${modelSrc}. Only FBX and GLB are supported at the moment.`);
    return Promise.reject(modelTypeError);
  }

  /**
   * Fetch modelSrc path and conver to arrayBuffer
   */
  let res = await fetch(modelSrc);

  if (res.ok) {
    let data = await res.arrayBuffer();

    /**
     * Find shader bases on the model file type.
     * When glb file, use Pbr as shader. Validate glb file by checking the first 4 bytes are glTF.
     * When fbx file, use UnlitTextured as shader. Validate fbx file by checking the first 20 bytes are Kaydara FBX Binary .
     */
    let shader = "";
    /* Check for GLB. */
    if (modelSrc.match(/\.glb(\?|#|$)/i) && String.fromCharCode.apply(null, new Uint8Array(data, 0, 4)) === "glTF") {
      shader = "Pbr";
    }
    /* Check for FBX. */
    else if (modelSrc.match(/\.fbx(\?|#|$)/i) && String.fromCharCode.apply(null, new Uint8Array(data, 0, 23)) === "Kaydara FBX Binary\x20\x20\x00\x1a\x00") {
      shader = "UnlitTextured";
    }
    /* Invalid file. */
    else {
      let modelTypeError = new Error(`Invalid model file: ${modelSrc}. Only FBX and GLB are supported at the moment.`);
      return Promise.reject(modelTypeError);
    }

    /**
     * Create a model resource from volume.
     */
    let resource = mlWorld[0].createModelResource(data);

    /**
     * Add kmat to resource.
     */
    if (el._kmat) {
      resource.kmat = el._kmat;
    }

    /**
     * Check if valid resource.
     */
    if (resource) {
      return {resource: resource, shader:shader};
    } else {
      return Promise.reject(new Error(`Load resource failed: ${modelSrc}`));
    }
  }
  else {
    return Promise.reject(new Error(`Load resource failed: ${modelSrc}`));
  }
};

export { loadResource }
