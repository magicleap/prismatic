/**
 * Create quad texture with the quad path.
 * Only JPG and PNG are supported at the moment.
 * Returns the texture.
 * @param {string} texturePath Path to image file for quad.
 * @returns {Promise} Promise object represents the texture.
 */
let createQuadTexture = (texturePath) => {
  /**
   * Check valid file extension OR valid base64 encoded image type.
   * Only JPG and PNG are supported.
   */
  let quadValidExtRe = new RegExp(/(\.(jpg|jpeg|png)(\?|#|$))|^(data:image\/(jpg|jpeg|png);base64,*)/i);

  if (!quadValidExtRe.test(texturePath)) {
    let quadTypeError = new Error(`Invalid quad image file type: ${texturePath}. Only JPG and PNG are supported at the moment for quads.`);
    return Promise.reject(quadTypeError);
  }

  /**
   * Create HTML image element with texture path.
   * Create texture using HTML image element.
   */
  return new Promise((resolve, reject) => {
    let img = new Image();

    img.onload = () => {

      /**
       * Create texture from JS Volume.
       */
      let texture = window.mlWorld[0].createTexture(img);

      /**
       * Check texture.
       */
      if (texture) {
        resolve(texture);
      } else {
        reject(new Error(`Problem loading quad texture: ${texturePath}.`));
      }
    };

    img.onerror = () => {
      reject(new Error(`Problem loading quad texture: ${texturePath}.`));
    };

    img.src = texturePath;
  });
}

export { createQuadTexture }
