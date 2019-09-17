/**
 * Parse and validate environment lighting attribute values.
 * Returns JSON Object with the  environment lighting properties.
 * @param {string} lightingString Environment lighting attribute value.
 * @returns {JSONObject} Properties for environment lighting.
 */
let parseEnvironmentLighting = (lightingString) => {
  var environmentLighting = {};
  lightingString.split(/;/).forEach(parameter => {
    /**
     * Each attribute value has property name and value (name:value).
     */
    var parameterArr = parameter.split(':');

    /**
     * Expects name and value.
     */
    if (parameterArr.length === 2) {
      environmentLighting[parameterArr[0].trim()] = parameterArr[1].trim();
    }
  });

  /**
   * Validate Environment Lighting object.
   */
  if (environmentLighting['color-intensity'] || environmentLighting['bloom-strength']) {
    return environmentLighting;
  } else {
    console.error('Invalid values used for environment lighting attribute. Make sure to specify color-intensity or bloom-strength.');
  }
};

export { parseEnvironmentLighting }
