/**
 * Iterate through array of textures paths and create an Image HTML element to create textures.
 * Returns the textures.
 * @param {Array.<String>} texturePathArray Path to texture files.
 * @returns {Promise} Promise object represents the textures.
 */
let createTextures = (texturePathsArr) => {

  return Promise.all(texturePathsArr.map(setImages));

  function setImages(texturePath) {
    return new Promise((resolve, reject) => {
      var img = new Image();

      img.onload = () => {
        resolve(mlWorld[0].createTexture(img, texturePath));
      }
      img.onerror = () => {
        reject(new Error(`Problem loading texture: ${texturePath}.`));
      }

      img.src = texturePath;
    });
  }
};

export { createTextures }
