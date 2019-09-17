/**
 * Parse and validate model-animation attribute values.
 * Attribute value could be in key:value format (name:name;paused:true;iterations:12) or just values delimeted by , (name, true, 12)
 * Use default values of false for paused and -1 for interactions.
 * Returns JSON Object with the model animation properties (name, paused and iterations).
 * @param {string} attributeValue Model animation attribute value.
 * @returns {JSONObject} Properties for model animation (name, paused and iterations).
 */
let parseModelAnimation = (attributeValue) => {
  let animation = {};
  let animationProps = ['name', 'paused', 'iterations']

  /**
   * Attribute parameter values delimeted by semi-colon or comma.
   */
  let attributeValueArr = attributeValue.split(/;|,/);

  attributeValueArr.forEach((parameter, i) => {
    /**
     * Each attribute value may have property name and value (name:value).
     */
    let parameterArr = parameter.split(':');

    /**
     * Property name and value (name:name; paused: false; iterations: 3;).
     */
    if (parameterArr.length === 2) {
      /**
       * Get numeric values and create array.
       */
      animation[parameterArr[0].trim()] = parameterArr[1].trim();
    }
    /**
     * No property name and value. Just property values (name, paused, iterations).
     */
    else if (parameterArr.length === 1) {
      animation[animationProps[i]] = parameterArr[0].trim();
    }
  });

  /**
   * Attribute validation.
   */
  if (!animation.name) {
    console.error('No animation name found in animation attribute.');
    return;
  }

  /**
   * If no paused property exists, set default value and show warning.
   */
  if (!animation.paused) {
    animation.paused = false;
    console.warn('Invalid paused value for animation attribute. Default value of false used.');
  }
  /**
   * Set paused property to boolean.
   */
  else {
    animation.paused = ((animation.paused === "false" || animation.paused ===  "no" || animation.paused ===  "0" || animation.paused === "") ? false : true);
  }

  /**
   * If no iterations property, set default value and show warning.
   */
  if (isNaN(parseInt(animation.iterations))) {
    animation.iterations = -1;
    console.warn('Invalid iterations value for model-animation attribute. Default value of -1 used.');
  }
  else {
    animation.iterations = parseInt(animation.iterations);
  }

  return animation;
};

export { parseModelAnimation }
