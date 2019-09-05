/**
 * @module utilities/parseMaterials
 */
/**
 * Validate and parse material attribute values.
 * Returns JSON Object with the material properties (kmat and textures).
 * @param {string} attributeValue Materials attribute value.
 * @returns {JSONObject} Properties for Materials (kmat and textures).
 */
let parseMaterials = (attributeValue) => {
  let materials = {};

  /**
   * Attribute values delimeted by semi-colon.
   */
  attributeValue.split(/;/).forEach(parameter => {
    /**
     * Each attribute value has property name and value (name:value).
     */
    let parameterArr = parameter.split(':');

    /**
     * Expects name and value.
     */
    if (parameterArr.length === 2) {
      if (parameterArr[0].trim() === 'textures') {
        /**
         * When textures parameter exists, replace commas, newline, tabs with
         * space and remove duplicate spaces to create array.
         */
        materials[parameterArr[0].trim()] = parameterArr[1].trim().replace(/\r?\n|\r|\t|,/gm, ' ').replace(/  +/g, ' ').split(/ /).filter((val) => val.trim());
      }
      else {
        /**
         * Kmat.
         */
        materials[parameterArr[0].trim()] = parameterArr[1].trim();
      }
    }
  });

  /**
   * Validate Kmat.
   */
  if (materials.kmat && materials.textures && materials.textures.length > 0) {
    return materials;
  }
  else {
    console.error('Invalid values used for materials attribute. No materials loaded.');
  }
};

export { parseMaterials }
